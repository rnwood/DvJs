using DvJs.Internal;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;

namespace DvJs
{
	class PluginScriptExecutionContext : ScriptExecutionContext
	{
		public PluginScriptExecutionContext(IPluginExecutionContext pluginContext, IOrganizationService service, ITracingService tracingService, EntityMetadataCache metadata, Entity target, Entity preImage, bool isNewRow) : base(pluginContext, service, tracingService, metadata, ctx => new Internal.EntityDynamicObject(target, preImage, isNewRow, ctx))
		{
			this.pluginContext = pluginContext;
		}

		public IPluginExecutionContext pluginContext { get; private set; }

	}
}
