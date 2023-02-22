using Esprima.Ast;
using Jint;
using Jint.Native;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;

namespace DvJs
{

	public class JavascriptCodeFromWebResourceActivity : JavascriptActivity
	{

		[RequiredArgument]
		[Input("Web Resource")]
		[ReferenceTarget("webresource")]
		public InArgument<EntityReference> ScriptWebResource { get; set; }

		protected override string GetScript(CodeActivityContext executionContext, out string source)
		{
			EntityReference scriptWebResourceRef = executionContext.GetValue(ScriptWebResource);

			IOrganizationService service = executionContext.GetExtension<IOrganizationServiceFactory>().CreateOrganizationService(null);
			return WebResourceHelpers.GetWebResourceContent(scriptWebResourceRef.Id, service, out source);
		}
	}
}
