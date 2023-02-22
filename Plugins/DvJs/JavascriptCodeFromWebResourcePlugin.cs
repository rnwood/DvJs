using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading.Tasks;

namespace DvJs
{
	public class JavascriptCodeFromWebResourcePlugin : JavascriptPlugin
	{
		public JavascriptCodeFromWebResourcePlugin(string insecureConfig)
		{
			this._webResourceIdOrName = insecureConfig;
		}

		private readonly string _webResourceIdOrName;

		protected override string GetScript(IServiceProvider serviceProvider, out string source)
		{
			IPluginExecutionContext context = serviceProvider.Get<IPluginExecutionContext>();
			string sourcePrefix = $"Message:{context.MessageName} of {context.PrimaryEntityName} => Webresource:";
			IOrganizationService service = serviceProvider.GetOrganizationService(Guid.Empty);

			Guid webResourceId;

			if (Guid.TryParse(this._webResourceIdOrName, out webResourceId)) {
				string result = WebResourceHelpers.GetWebResourceContent(webResourceId, service, out source);
				source = sourcePrefix + source;
				return result;
			}
			source = $"{sourcePrefix}{this._webResourceIdOrName}";
			return WebResourceHelpers.GetWebResourceContent(this._webResourceIdOrName, service);
		}
	}
}
