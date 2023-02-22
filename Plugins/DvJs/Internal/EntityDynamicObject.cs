using Jint.Runtime.Debugger;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Reflection;
using System.ServiceModel.Configuration;
using System.Text;
using System.Threading.Tasks;

namespace DvJs.Internal
{
	internal class EntityDynamicObject : DynamicObject
	{
		public EntityDynamicObject(Entity entity, Entity preImage, bool isNewRow, ScriptExecutionContext context)
		{
			if (preImage != null)
			{
				this.EntityChanges = entity ?? throw new ArgumentNullException("entity");
				this.PreImage = preImage;
			}
			else if (isNewRow)
			{
				this.EntityChanges = entity ?? throw new ArgumentNullException("entity");
				this.PreImage = new Entity(entity.LogicalName, entity.Id);
			}
			else
			{
				this.PreImage = entity ?? throw new ArgumentNullException("entity");
				this.EntityChanges = new Entity(entity.LogicalName, entity.Id);
			}

			this._context = context ?? throw new ArgumentNullException("context");
		}

		internal Entity EntityChanges { get; private set; }
		internal Entity PreImage { get; private set; }

		private readonly ScriptExecutionContext _context;

		private readonly Dictionary<string, EntityDynamicObject> _relationshipToOneCache = new Dictionary<string, EntityDynamicObject>();
		private readonly Dictionary<string, EntityDynamicObject[]> _relationshipToManyCache = new Dictionary<string, EntityDynamicObject[]>();

		public string LogicalName { get { return this.EntityChanges.LogicalName; } }

		public string Id { get { return this.EntityChanges.LogicalName; } }

		public override bool TryGetMember(GetMemberBinder binder, out object result)
		{
			if (base.TryGetMember(binder, out result)) return true;

			EntityMetadata entityMetadata = this._context.metadata.Get(EntityChanges.LogicalName);
			AttributeMetadata attribute = entityMetadata.Attributes.FirstOrDefault(a => a.LogicalName == binder.Name);
			if (attribute != null)
			{
				result = GetColumnValue(binder, attribute);

				return true;

			}

			OneToManyRelationshipMetadata oneToManyRelationship = entityMetadata.OneToManyRelationships.FirstOrDefault(r => r.SchemaName.Equals(binder.Name, StringComparison.OrdinalIgnoreCase));
			if (oneToManyRelationship != null)
			{
				if (_relationshipToManyCache.TryGetValue(binder.Name, out EntityDynamicObject[] cachedValue))
				{
					result = cachedValue;
				}
				else
				{
					result = _relationshipToManyCache[binder.Name] = GetOneToManyRelatedRecords(oneToManyRelationship);
				}
				return true;
			}

			ManyToManyRelationshipMetadata manyToManyRelationship = entityMetadata.ManyToManyRelationships.FirstOrDefault(r => r.SchemaName.Equals(binder.Name, StringComparison.OrdinalIgnoreCase));
			if (manyToManyRelationship != null)
			{
				if (_relationshipToManyCache.TryGetValue(binder.Name, out EntityDynamicObject[] cachedValue))
				{
					result = cachedValue;
				}
				else
				{
					result = _relationshipToManyCache[binder.Name] = GetManyToManyRelatedRecord(entityMetadata, manyToManyRelationship);
				}

				return true;
			}

			throw new ArgumentException($"Attribute/relationship with name '{binder.Name}' not found in entity type '{EntityChanges.LogicalName}'");
		}

		private object GetColumnValue(GetMemberBinder binder, AttributeMetadata attribute)
		{
			if (attribute is LookupAttributeMetadata lookupAttributeMetada)
			{
				if (_relationshipToOneCache.TryGetValue(binder.Name, out EntityDynamicObject cachedValue))
				{
					return cachedValue;
				}
				else
				{
					EntityDynamicObject valueToCache = null;

					TryGetRawValue(binder.Name, out object rawValue);
					if (rawValue != null)
					{
						valueToCache = ConversionHelpers.GetManyToOneRelatedRecord(this._context, (EntityReference)rawValue);
					}

					_relationshipToOneCache[binder.Name] = valueToCache;
					return valueToCache;
				}
			}
			else if (TryGetRawValue(binder.Name, out object rawValue))
			{
				return ConversionHelpers.ConvertToJsValue(this._context, rawValue);
			}

			return null;
		}

		private bool TryGetRawValue(string columnName, out object result)
		{
			//Get from target if present, or from pre-image (if available) if not.
			return EntityChanges.TryGetAttributeValue(columnName, out result) ||
							(this.PreImage?.TryGetAttributeValue(columnName, out result)).GetValueOrDefault();
		}

		private EntityDynamicObject[] GetManyToManyRelatedRecord(EntityMetadata entityMetadata, ManyToManyRelationshipMetadata manyToManyRelationship)
		{
			if (EntityChanges.Id == Guid.Empty)
			{
				return null;
			}
			else
			{
				bool thisTableIsTable2 = manyToManyRelationship.Entity2LogicalName == entityMetadata.LogicalName;

				string thisTableAttribute = entityMetadata.PrimaryIdAttribute;
				string thisTableIntersectAttribute = thisTableIsTable2 ? manyToManyRelationship.Entity2IntersectAttribute : manyToManyRelationship.Entity1IntersectAttribute;

				string otherTableName = thisTableIsTable2 ? manyToManyRelationship.Entity1LogicalName : manyToManyRelationship.Entity2LogicalName;
				EntityMetadata otherTableMetadata = this._context.metadata.Get(otherTableName);
				string otherTableAttribute = otherTableMetadata.PrimaryIdAttribute;
				string otherTableIntersectAttribute = thisTableIsTable2 ? manyToManyRelationship.Entity1IntersectAttribute : manyToManyRelationship.Entity2IntersectAttribute;


				QueryExpression relatedEntityQuery = new QueryExpression(otherTableName)
				{
					ColumnSet = new ColumnSet(true)
				};

				LinkEntity intersectLink = relatedEntityQuery
					.AddLink(manyToManyRelationship.IntersectEntityName, otherTableAttribute, otherTableIntersectAttribute);
				intersectLink.LinkCriteria.AddCondition(thisTableIntersectAttribute, ConditionOperator.Equal, this.EntityChanges.Id);

				List<EntityDynamicObject> results = new List<EntityDynamicObject>();

				EntityCollection relatedEntityCol = this._context.organizationService.RetrieveMultiple(relatedEntityQuery);
				results.AddRange(relatedEntityCol.Entities.Select(e => new EntityDynamicObject(e, null, false, this._context)));

				while (relatedEntityCol.MoreRecords)
				{
					relatedEntityQuery.PageInfo = new PagingInfo { PagingCookie = relatedEntityCol.PagingCookie };
					relatedEntityCol = this._context.organizationService.RetrieveMultiple(relatedEntityQuery);
					results.AddRange(relatedEntityCol.Entities.Select(e => new EntityDynamicObject(e, null, false, this._context)));
				}

				return results.ToArray();
			}

		}


		private EntityDynamicObject[] GetOneToManyRelatedRecords(OneToManyRelationshipMetadata relationshipMetadata)
		{
			List<EntityDynamicObject> results = new List<EntityDynamicObject>();

			if (EntityChanges.Id != Guid.Empty)
			{
				QueryByAttribute relatedEntityQuery = new QueryByAttribute(relationshipMetadata.ReferencingEntity)
				{
					ColumnSet = new ColumnSet(true)
				};
				relatedEntityQuery.AddAttributeValue(relationshipMetadata.ReferencingAttribute, EntityChanges.Id);
				EntityCollection relatedEntityCol = this._context.organizationService.RetrieveMultiple(relatedEntityQuery);
				results.AddRange(relatedEntityCol.Entities.Select(e => new EntityDynamicObject(e, null, false, this._context)));

				while (relatedEntityCol.MoreRecords)
				{
					relatedEntityQuery.PageInfo = new PagingInfo { PagingCookie = relatedEntityCol.PagingCookie };
					relatedEntityCol = this._context.organizationService.RetrieveMultiple(relatedEntityQuery);
					results.AddRange(relatedEntityCol.Entities.Select(e => new EntityDynamicObject(e, null, false, this._context)));
				}
			}

			return results.ToArray();
		}

		public override bool TrySetMember(SetMemberBinder binder, object value)
		{
			EntityMetadata entityMetadata = this._context.metadata.Get(EntityChanges.LogicalName);

			AttributeMetadata attribute = entityMetadata.Attributes.FirstOrDefault(a => a.LogicalName == binder.Name);
			if (attribute != null)
			{
				if (value != null)
				{
					switch (attribute.AttributeType)
					{
						case AttributeTypeCode.Memo:
						case AttributeTypeCode.String:
							value = GetStringValue(value, attribute);
							break;
						case AttributeTypeCode.Boolean:
							value = GetBooleanValue(value, attribute);
							break;
						case AttributeTypeCode.DateTime:
							value = GetDateTimeValue(value, attribute);
							break;
						case AttributeTypeCode.Picklist:
						case AttributeTypeCode.State:
						case AttributeTypeCode.Status:
							value = GetOptionsetValue(value, attribute);
							break;

						case AttributeTypeCode.Decimal:
							value = GetDecimalValue(value, attribute);
							break;
						case AttributeTypeCode.Double:
							value = GetDoubleValue(value, attribute);
							break;
						case AttributeTypeCode.Integer:
							value = GetIntegerValue(value, attribute);
							break;
						case AttributeTypeCode.Money:
							value = GetMoneyValue(value, attribute);
							break;

						case AttributeTypeCode.Owner:
						case AttributeTypeCode.Customer:
						case AttributeTypeCode.Lookup:
							value = GetLookupAttributeValue(value, attribute, out EntityDynamicObject cacheValue);
							_relationshipToOneCache[binder.Name] = cacheValue;
							break;
						default:
							throw new NotImplementedException($"Attribute type {attribute.AttributeType} is not implemented.");
					}
				}

				EntityChanges[binder.Name] = value;

				if ((PreImage != null && PreImage.TryGetAttributeValue<object>(binder.Name, out object oldValue)))
				{
					if (oldValue == value || (oldValue?.Equals(value)).GetValueOrDefault())
					{
						EntityChanges.Attributes.Remove(binder.Name);
					}
				}

				return true;
			}

			throw new ArgumentException($"Attribute with name '{binder.Name}' not found in entity type '{EntityChanges.LogicalName}'");

			return false;
		}

		private OptionSetValue GetOptionsetValue(object value, AttributeMetadata attribute)
		{
			int numericValue = Convert.ToInt32(value);
			return new OptionSetValue(numericValue);
		}

		private decimal GetDecimalValue(object value, AttributeMetadata attribute)
		{
			return Convert.ToDecimal(value);
		}

		private double GetDoubleValue(object value, AttributeMetadata attribute)
		{
			return Convert.ToDouble(value);
		}

		private int GetIntegerValue(object value, AttributeMetadata attribute)
		{
			return Convert.ToInt32(value);
		}

		private Money GetMoneyValue(object value, AttributeMetadata attribute)
		{
			return new Money(Convert.ToDecimal(value));
		}

		private DateTime GetDateTimeValue(object value, AttributeMetadata attribute)
		{
			return Convert.ToDateTime(value);
		}

		private bool GetBooleanValue(object value, AttributeMetadata attribute)
		{
			return Convert.ToBoolean(value);
		}

		private string GetStringValue(object value, AttributeMetadata attribute)
		{
			return Convert.ToString(value);
		}

		private static EntityReference GetLookupAttributeValue(object value, AttributeMetadata attribute, out EntityDynamicObject entityValue)
		{
			LookupAttributeMetadata lookupAttributeMetadata = (LookupAttributeMetadata)attribute;

			if (value == null)
			{
				entityValue = null;
				return null;
			}
			else if (value is EntityDynamicObject entityDynamicObject)
			{
				entityValue = entityDynamicObject;
				if (entityDynamicObject.EntityChanges.Id == Guid.Empty)
				{
					throw new ArgumentException($"The related {entityDynamicObject.EntityChanges.LogicalName} entity does not have an ID. Create the entity first or assign an ID manually to the Id property.", "value");
				}

				if (!lookupAttributeMetadata.Targets.Contains(entityDynamicObject.EntityChanges.LogicalName))
				{
					throw new ArgumentException($"The related entity must be a {string.Join(" or ", lookupAttributeMetadata.Targets)}, but is actually a '{entityDynamicObject.EntityChanges.LogicalName}'");
				}

				return entityDynamicObject.EntityChanges.ToEntityReference();
			}
			else
			{
				throw new ArgumentException($"The related object must be an entity. It is {value?.GetType()}");
			}
		}

		//public override bool TryConvert(ConvertBinder binder, out object result)
		//{
		//	if (binder.Type == typeof(Entity))
		//	{
		//		result = Entity;
		//		return true;
		//	}

		//	result = null;
		//	return false;
		//}
	}
}
