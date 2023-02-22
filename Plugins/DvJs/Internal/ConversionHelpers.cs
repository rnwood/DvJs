using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DvJs.Internal
{
	internal class ConversionHelpers
	{

		public static object ConvertToJsValue(ScriptExecutionContext context, object result)
		{
			if (result is EntityReference relatedEntityReference)
			{
				result = GetManyToOneRelatedRecord(context, relatedEntityReference);
			}
			else if (result is Money moneyValue)
			{
				result = moneyValue.Value;
			}
			else if (result is OptionSetValue optionSetValue)
			{
				result = optionSetValue.Value;
			}

			return result;
		}
		public static EntityDynamicObject GetManyToOneRelatedRecord(ScriptExecutionContext context, EntityReference relatedEntityReference)
		{
			EntityDynamicObject result = null;

			Entity relatedEntity = context.organizationService.Retrieve(relatedEntityReference.LogicalName, relatedEntityReference.Id, new Microsoft.Xrm.Sdk.Query.ColumnSet(true));
			if (relatedEntity != null)
			{
				result = new EntityDynamicObject(relatedEntity, null, false, context);
			}

			return result;
		}
	}
}
