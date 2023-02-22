using DvJs.Internal;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Extensions;
using System;

namespace DvJs
{
	public abstract class JavascriptPlugin : IPlugin
	{
		private const int PLUGINEXECUTIONSTAGE_PREOPERATION = 20;
		private const int PLUGINEXECUTIONSTAGE_PREVALIDATION = 10;

		public void Execute(IServiceProvider serviceProvider)
		{
			try
			{

				IOrganizationServiceFactory serviceFactory = serviceProvider.Get<IOrganizationServiceFactory>();
				IOrganizationService service = serviceFactory.CreateOrganizationService(Guid.Empty);
				ITracingService tracingService = serviceProvider.Get<ITracingService>();
				IPluginExecutionContext pluginExecutionContext = serviceProvider.Get<IPluginExecutionContext>();

				Entity target = pluginExecutionContext.InputParameters["Target"] as Entity;

				if (target == null)
				{
					EntityReference targetRef = pluginExecutionContext.InputParameters["Target"] as EntityReference;
					if (targetRef != null)
					{
						if (pluginExecutionContext.MessageName == "Delete")
						{
							target = new Entity(targetRef.LogicalName, targetRef.Id);
						}
						else
						{
							target = service.Retrieve(targetRef.LogicalName, targetRef.Id, new Microsoft.Xrm.Sdk.Query.ColumnSet(true));
						}
					}
				}

				Entity preImage = null;
				bool isNewRow = false;
				if (pluginExecutionContext.MessageName == "Update" || pluginExecutionContext.MessageName == "Delete")
				{
					if (!pluginExecutionContext.PreEntityImages.TryGetValue("PreImage", out preImage))
					{
						if (pluginExecutionContext.Stage == PLUGINEXECUTIONSTAGE_PREOPERATION || pluginExecutionContext.Stage == PLUGINEXECUTIONSTAGE_PREVALIDATION)
						{
							preImage = service.Retrieve(target.LogicalName, target.Id, new Microsoft.Xrm.Sdk.Query.ColumnSet(true));
						}
						else
						{
							throw new InvalidPluginExecutionException(OperationStatus.Failed, "Post-stage update or delete plugin steps must have a configured pre-Image named PreImage");
						}
					}
				}else if (pluginExecutionContext.MessageName == "Create")
				{
					if (pluginExecutionContext.Stage == PLUGINEXECUTIONSTAGE_PREOPERATION || pluginExecutionContext.Stage == PLUGINEXECUTIONSTAGE_PREVALIDATION)
					{
						isNewRow = true;
					}
				}
								

				EntityMetadataCache metadata = new EntityMetadataCache(service);

				ScriptExecutionContext context = new PluginScriptExecutionContext(pluginExecutionContext, service, tracingService, metadata, target, preImage, isNewRow);

				string script = GetScript(serviceProvider, out string source);

				JavascriptHelpers.Evaluate(script, source, context);

			}
			catch (Exception ex)
			{
				throw new InvalidPluginExecutionException(OperationStatus.Failed, ex.ToString());
			}
		}

		protected abstract string GetScript(IServiceProvider serviceProvider, out string source);
	}
}
