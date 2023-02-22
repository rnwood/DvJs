using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Extensions;
using Microsoft.Xrm.Sdk.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DvJs.Internal
{
	internal class EntityMetadataCache
	{
		public EntityMetadataCache(IOrganizationService service)
		{
			this._service= service;
		}

		private readonly IOrganizationService _service;


		public EntityMetadata Get(string entityName)
		{
			if (_entityMetadata.TryGetValue(entityName, out var entityMetadata))
			{
				return entityMetadata;
			}

			entityMetadata = _service.GetEntityMetadata(entityName);
			_entityMetadata[entityName] = entityMetadata;
			return entityMetadata;
		}

		private IDictionary<string, EntityMetadata> _entityMetadata = new Dictionary<string, EntityMetadata>();
	}
}
