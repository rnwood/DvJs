using DvJs.Internal;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using System;

namespace DvJs
{
	class WorkflowScriptExecutionContext : ScriptExecutionContext
	{
		public WorkflowScriptExecutionContext(IWorkflowContext workflowContext, IOrganizationService organizationService, ITracingService service, EntityMetadataCache metadata, Func<ScriptExecutionContext, EntityDynamicObject> targetGetter) : base(workflowContext, organizationService, service, metadata, targetGetter)
		{
			this.workflowContext = workflowContext;
		}

		public IWorkflowContext workflowContext { get; private set; }



	}
}
