using DvJs.Internal;
using Microsoft.Xrm.Sdk;
using System;
using System.Threading;

namespace DvJs
{
	class ScriptExecutionContext
	{
		public ScriptExecutionContext(IExecutionContext executionContext, IOrganizationService organizationService, ITracingService tracingService, EntityMetadataCache metadata, Func<ScriptExecutionContext, EntityDynamicObject> targetGetter)
		{
			this.executionContext = executionContext;
			this.organizationService = organizationService;
			this.tracingService = tracingService;
			this.target = targetGetter(this);
			this.metadata = metadata;
		}

		public IExecutionContext executionContext { get; private set;}

		public IOrganizationService organizationService { get; private set; }
		public ITracingService tracingService { get; private set; }
		public EntityDynamicObject target { get; private set; }

		public EntityMetadataCache metadata { get; private set; }
	}

}
