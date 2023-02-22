using DvJs.Internal;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using System;
using System.Activities;

namespace DvJs
{
	public abstract class JavascriptActivity : CodeActivity
	{
		[Output("Result")]
		public OutArgument<string> Result { get; set; }

		protected override void Execute(CodeActivityContext executionContext)
		{
			string script = GetScript(executionContext, out string source);
			source = "Workflow activity => Webresource:" + source;

			IWorkflowContext context = executionContext.GetExtension<IWorkflowContext>();
			IOrganizationServiceFactory serviceFactory = executionContext.GetExtension<IOrganizationServiceFactory>();
			IOrganizationService service = serviceFactory.CreateOrganizationService(Guid.Empty);
			ITracingService tracingService = executionContext.GetExtension<ITracingService>();
			Entity target = service.Retrieve(context.PrimaryEntityName, context.PrimaryEntityId, new Microsoft.Xrm.Sdk.Query.ColumnSet(true));
			EntityMetadataCache metadata = new EntityMetadataCache(service);


			Func<ScriptExecutionContext, EntityDynamicObject> entityCreator = (ctx) => new Internal.EntityDynamicObject(target, null, false, ctx);

			ScriptExecutionContext scriptContext = new WorkflowScriptExecutionContext(context, service, tracingService, metadata, entityCreator);

			string stringedResult = JavascriptHelpers.Evaluate(script, source, scriptContext);

			executionContext.SetValue(Result, stringedResult);

		}

		protected abstract string GetScript(CodeActivityContext executionContext, out string source);
	}
}
