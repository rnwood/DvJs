using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DvJs
{
	public class JavascriptCodePlugin : JavascriptPlugin
	{
		public JavascriptCodePlugin(string insecureConfig)
		{
			this._script = insecureConfig;
		}

		private readonly string _script;

		protected override string GetScript(IServiceProvider serviceProvider, out string source)
		{
			IPluginExecutionContext context = serviceProvider.Get<IPluginExecutionContext>();

			source = "pluginstep-" + context.OwningExtension.Id;
			return this._script;
		}
	}
}
