using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Linq;
using System.Text;

namespace DvJs
{
	internal static class WebResourceHelpers
	{
		public static string GetWebResourceContent(string name, IOrganizationService service)
		{
			QueryByAttribute query = new QueryByAttribute("webresource")
			{
				ColumnSet = new ColumnSet("content")
			};

			query.AddAttributeValue("name", name);

			Entity webResource = service.RetrieveMultiple(query).Entities.FirstOrDefault();

			if (webResource == null)
			{
				throw new InvalidPluginExecutionException(OperationStatus.Failed, $"Could not find webresource with name '{name}'");
			}

			return GetContentFromWebResourceRecord(webResource);
		}

		public static string GetWebResourceContent(Guid id, IOrganizationService service, out string name)
		{
			Entity webResource = service.Retrieve("webresource", id, new Microsoft.Xrm.Sdk.Query.ColumnSet("content", "name"));

			if (webResource == null)
			{
				throw new InvalidPluginExecutionException(OperationStatus.Failed, $"Could not find webresource with ID {id}");
			}

			name = webResource.GetAttributeValue<string>("name");

			return GetContentFromWebResourceRecord(webResource);
		}

		private static string GetContentFromWebResourceRecord(Entity webResource)
		{
			string scriptBase64 = webResource.GetAttributeValue<string>("content");
			if (string.IsNullOrEmpty(scriptBase64))
			{
				return "";
			}

			string script = Encoding.UTF8.GetString(Convert.FromBase64String(scriptBase64));
			return script;
		}
	}
}