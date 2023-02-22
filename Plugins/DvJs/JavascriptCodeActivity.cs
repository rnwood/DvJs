using Esprima.Ast;
using Jint;
using Jint.Native;
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

	public class JavascriptCodeActivity : JavascriptActivity
	{

		[RequiredArgument]
		[Input("Script")]
		public InArgument<string> Script { get; set; }

		protected override string GetScript(CodeActivityContext executionContext, out string name)
		{
			name = "workflowinlinecode";

			return executionContext.GetValue(Script);
		}

	}
}
