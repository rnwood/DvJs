using DvJs.Internal;
using Jint;
using Jint.Native;
using Jint.Runtime;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Linq;

namespace DvJs
{
	internal static class JavascriptHelpers
	{
		public static string Evaluate(string script, string source, ScriptExecutionContext scriptContext)
		{
			var engine = new Engine(o =>
			{
				o.Strict = true;
				o.CatchClrExceptions();
			});

			engine.SetValue("context", scriptContext);
			engine.SetValue("target", scriptContext.target);
			engine.SetValue("require", (Func<string, JsValue>)(webResourceName => Require(engine, scriptContext, webResourceName)));
			engine.SetValue("newentity", (Func<string, EntityDynamicObject>)(entityName => NewEntity(engine, scriptContext, entityName)));
			engine.SetValue("create", (Func<EntityDynamicObject, string>)(entity => Create(engine, scriptContext, entity)));
			engine.SetValue("update", (Action<EntityDynamicObject>)(entity => Update(engine, scriptContext, entity)));
			engine.SetValue("delete", (Action<EntityDynamicObject>)(entity => Delete(engine, scriptContext, entity)));
			engine.SetValue("envvar", (Func<string, string>)(name => EnvVar(engine, scriptContext, name)));
			engine.SetValue("retrieve", (Func<string, string, EntityDynamicObject>)((entityName, id) => Retrieve(engine, scriptContext, entityName, id)));
			engine.SetValue("reload", (Func<EntityDynamicObject, EntityDynamicObject>)((entity) => Reload(engine, scriptContext, entity)));
			engine.SetValue("setOutputEntityReference", (Action<string, EntityDynamicObject>)((key, entity) => SetOutputEntityReference(engine, scriptContext, key, entity)));
			engine.SetValue("action", (Func<EntityDynamicObject, string, JsValue>)((entity, actionName) => Action(engine, scriptContext, entity, actionName)));

			try
			{
				JsValue result = engine.Evaluate(script, source);
				string stringedResult = "";

				if (result != JsValue.Undefined && result != JsValue.Null)
				{
					result.ToString();
				}
				return stringedResult;
			}
			catch (Esprima.ParserException ex)
			{

				throw new InvalidPluginExecutionException(OperationStatus.Failed, $"Javascript parse failed: {ex.Message}\r\n\r\n***Javascript source:{source}***\r\n\r\n");

			}
			catch (JavaScriptException ex)
			{
				throw new InvalidPluginExecutionException(OperationStatus.Failed, "Javascript eval failed with JS error " + ex.ToString() + "\r\n\r\n***Javascript stack:\n" + ex.JavaScriptStackTrace + "***\r\n\r\n" + ex.GetJavaScriptErrorString());

			}
		}


		private static JsValue Action(Engine engine, ScriptExecutionContext scriptContext, EntityDynamicObject entity, string actionName)
		{
			try
			{
				OrganizationRequest request = new OrganizationRequest(actionName);
				request.Parameters["Target"] = entity.EntityChanges.ToEntityReference();

				OrganizationResponse response = scriptContext.organizationService.Execute(request);

				var result = response.Results.ToDictionary(r => r.Key, r =>
				{
					object value = r.Value;

					value = ConversionHelpers.ConvertToJsValue(scriptContext, value);

					return value;
				});

				return JsValue.FromObject(engine, result);
			}
			catch (Exception e)
			{
				throw new JavaScriptException(e.ToString() + "\n" + e.StackTrace);
			}

		}

		private static EntityDynamicObject Reload(Engine engine, ScriptExecutionContext scriptContext, EntityDynamicObject entityScriptObject)
		{
			try
			{

				Entity entity = scriptContext.organizationService.Retrieve(entityScriptObject.LogicalName, entityScriptObject.EntityChanges.Id, new ColumnSet(true));
				EntityDynamicObject result = new EntityDynamicObject(entity, null, false, scriptContext);

				return result;
			}
			catch (Exception e)
			{
				throw new JavaScriptException(e.ToString() + "\n" + e.StackTrace);
			}
		}

		private static EntityDynamicObject Retrieve(Engine engine, ScriptExecutionContext scriptContext, string entityName, string id)
		{
			try
			{

				if (!Guid.TryParse(id, out Guid idAsGuid))
				{
					throw new ArgumentException($"'{id}' is not a valid GUID", nameof(id));
				}

				Entity entity = scriptContext.organizationService.Retrieve(entityName, idAsGuid, new ColumnSet(true));
				EntityDynamicObject result = new EntityDynamicObject(entity, null, false, scriptContext);

				return result;
			}
			catch (Exception e)
			{
				throw new JavaScriptException(e.ToString() + "\n" + e.StackTrace);
			}
		}

		private static string EnvVar(Engine engine, ScriptExecutionContext scriptContext, string name)
		{
			try
			{
				QueryExpression query = new QueryExpression("environmentvariablevalue")
				{
					ColumnSet = new ColumnSet("value")
				};

				LinkEntity defLink = query.AddLink("environmentvariabledefinition", "environmentvariabledefinitionid", "environmentvariabledefinitionid");
				defLink.LinkCriteria.AddCondition("schemaname", ConditionOperator.Equal, name);

				Entity evValue = scriptContext.organizationService.RetrieveMultiple(query).Entities.FirstOrDefault();

				if (evValue == null)
				{
					throw new InvalidPluginExecutionException(OperationStatus.Failed, $"Environment variable with schema name '{name}' not found");
				}

				string result = evValue.GetAttributeValue<string>("value");
				return result;
			}
			catch (Exception e)
			{
				throw new JavaScriptException(e.ToString() + "\n" + e.StackTrace);
			}

		}

		private static void SetOutputEntityReference(Engine engine, ScriptExecutionContext scriptContext, string key, EntityDynamicObject value)
		{
			try
			{
				scriptContext.executionContext.OutputParameters[key] = value.EntityChanges.ToEntityReference();
			}
			catch (Exception e)
			{
				throw new JavaScriptException(e.ToString() + "\n" + e.StackTrace);
			}
		}

		private static string Create(Engine engine, ScriptExecutionContext scriptContext, EntityDynamicObject entity)
		{
			try
			{

				Guid result = scriptContext.organizationService.Create(entity.EntityChanges);
				entity.EntityChanges.Id = entity.PreImage.Id = result;
				return result.ToString();
			}
			catch (Exception e)
			{
				throw new JavaScriptException(e.ToString() + "\n" + e.StackTrace);
			}
		}

		private static void Update(Engine engine, ScriptExecutionContext scriptContext, EntityDynamicObject entity)
		{
			try
			{
				if (entity.EntityChanges.TryGetAttributeValue<OptionSetValue>("statuscode", out OptionSetValue statusCodeValue) 
					&& statusCodeValue != null 
					&& !entity.EntityChanges.TryGetAttributeValue<OptionSetValue>("statecode", out OptionSetValue stateCodeValue))
				{
					var metadata = scriptContext.metadata.Get(entity.LogicalName);

					StatusAttributeMetadata statusCodeMetadata = (StatusAttributeMetadata) metadata.Attributes.First(a => a.LogicalName == "statuscode");
					StatusOptionMetadata statusCodeChoice = statusCodeMetadata.OptionSet.Options.Cast<StatusOptionMetadata>().FirstOrDefault(c => c.Value == statusCodeValue.Value);

					entity.EntityChanges["statecode"] = new OptionSetValue(statusCodeChoice.State.Value);
				}
				

				scriptContext.organizationService.Update(entity.EntityChanges);
			}
			catch (Exception e)
			{
				throw new JavaScriptException(e.ToString() + "\n" + e.StackTrace);
			}
		}

		private static void Delete(Engine engine, ScriptExecutionContext scriptContext, EntityDynamicObject entity)
		{
			try
			{
				scriptContext.organizationService.Delete(entity.EntityChanges.LogicalName, entity.EntityChanges.Id);
			}
			catch (Exception e)
			{
				throw new JavaScriptException(e.ToString() + "\n" + e.StackTrace);
			}
		}

		private static EntityDynamicObject NewEntity(Engine engine, ScriptExecutionContext scriptContext, string entityName)
		{
			try
			{
				Microsoft.Xrm.Sdk.Entity entity = new Microsoft.Xrm.Sdk.Entity(entityName);
				EntityDynamicObject result = new EntityDynamicObject(entity, null, true, scriptContext);
				return result;
			}
			catch (Exception e)
			{
				throw new JavaScriptException(e.ToString() + "\n" + e.StackTrace);
			}
		}

		private static JsValue Require(Engine engine, ScriptExecutionContext scriptContext, string webResourceName)
		{
			try
			{
				string requiredScript = WebResourceHelpers.GetWebResourceContent(webResourceName, scriptContext.organizationService);
				var result = engine.Evaluate(requiredScript, webResourceName);
				return result;
			}
			catch (Exception e)
			{
				throw new JavaScriptException(e.ToString() + "\n" + e.StackTrace);
			}
		}
	}
}