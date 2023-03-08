# DvJs

DvJs is a set of extensions for Microsoft Dataverse (Power Platform, Power Apps) that allows you to write JavaScript event handlers that run server side for plugin steps, custom APIs and classic workflow steps. These scripts use a highly simplified low-code(ish) API to interact with Dataverse, in order to make it as easy as possible to write them quickly.

DvJs could also potentially be used to allow rules in your app to be configurable using scripts, allowing a lot more flexibility than is possible using a data-driven approach.

## Getting Started

One time:
1) Import the managed solution

For each event you want to handle:
1) Create a web resource containing the JS you want to execute. See the docs below for the available API.
2) Run the plugin registration tool. The easiest way to run this is using [Power Apps CLI](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) command `pac tool prt`.
2) Create step against `DvJs.JavascriptCodeFromWebResourcePlugin` plugin type. See the docs below for more info on the supported events.
3) Put the schema name of the webresource in the unsecure configuration for the plugin step.
4) Don't forget to add the plugin step to your solution.

## FAQs
### Q: Why would you do this?
The platform currently has a gap in terms of it's capability to add synchronous logic/APIs using a low-code approach for rapid development and easier maintenance. Classic workflows and business rules can do some of this, but are extremely limited (no looping etc) because of their dated no-code approach.

*Hopefully, MS will very quickly fill this gap in the platform soon and this will no longer be needed!*

### Q: Why low-code?

Low-code (a simple language and a simple API) let us develop and iterate quicker - More time focusing on the core logic of the system and not on the platform and plumbing needed to get it to work.

The cons are less flexibility/capability than a lower level language/API and reduced performance.

### Q: Why not do this using PowerFX language?

The idea for DvJs came about before PowerFX was a thing. Using PowerFx is a great idea and we hope that MS will add this natively to the Dataverse platform soon.

[Check out cchannon/PowerFXPlugin](https://github.com/cchannon/PowerFXPlugin) for a project that is attempting to do this in the mean time, although this project currently only allows very simple use-cases to be achieved.

### Q: Why is being able to run synchronously important? (Why not use Power Automate?)

Power Automate is great, but it cannot process changes sychronously during Dataverse events.

Being able to run synchronously is important both for consistency and for user-experience.

Consistency - Async actions are only eventually consistent. But if no-one is monitoring and taking compensating actions when they fail, data can be lost and left in an incomplete state! I believe that all key business rules within a system should be strongly consistent unless a robust design/system is put in place where it is required to ensure the "evental" can actually be achieved. The trade-off of synchronous is that the user will need to wait whilst the actions are peformed and (benefit or drawback depending on case) they will directly see any resulting errors. So choose carefully, but don't make async the default unless you accept the work involved.

User-experience - Users have an expectation that most actions within a system should be processed in real time, expecially if they are "simple". e.g. Many would consider it unexpected if after changing "last name", that after hitting save "full name" is not immediately up to date and visible to them. 
So again, I believe that sync actions should be the default except where it can reasonably be expected by the user and the UX has been considered so they are aware displayed info may be outdated.

### Q: What is the level of stabilty?
Experimental - use this in production projects at your own risk! It is most suited to internal tools and demos where you need to move rapidly or for early stages of project where you will come back and replace the scripts with proper plugins.

### Q: How is the performance?
Obviously this approach carries an overhead vs writing hand-crafted and optimised plugins. If you are processing many transactions or dealing with 1000s of records, think carefully and measure the performance yourself before use.

## Example Scripts

### Super simple calculation

*What this example does: Updates fullname based on firstname and lastname. Note no complex code to retrieve pre-image and check what has changed - all columns available to read via target reflecting latest state of the row. This example is registered in the pre-operatation stage, so the change to target is automatically saved.*
```
target.mycorp_fullname = target.mycorp_firstname + " " + target.mycorp_lastname;
```

### Handling Update and Setting Status of Related Record

*What this example does: Check if the `mycorp_iscomplete` column value is true and if so, sets the status of the related record to complete. The related record is fetched automatically when it is referenced.*
```
if (target.mycorp_iscomplete) {
    let myParent = target.mycorp_parentid;
    myParent.statecode = 1; //Inactive
    myParent.statuscode = 2; //Complete
    update(myParent);
}
```

### Handling Create message and calling a custom API

*What this example does: Triggers when a new row is created and uses the custom API (next example) to generate a new related set of records. Then modifies the current row before it is aved to associate with it.*

```
let defId = envvar("mycorp_AppTechnicalAssessmentDefinitionId");
let def = retrieve("mycorp_assessmentdefinition", defId);

let assessment = action(def, "mycorp_CreateAssessmentFromDefinition").CreatedAssessmentId;

target.mycorp_technicalassessmentid = assessment;
```

### Custom API implementation (Row Scoped)

*What this example does: Creates a complex set of related records by copying from a set of 'definition' records. Notice that there is no code needed to fetch the related records.*
```
let definition = target;

let assessment = newentity("mycorp_assessment");
assessment.mycorp_assessmentdefinitionid = definition;
assessment.mycorp_name = definition.mycorp_name;
create(assessment);


for(let sectionDef of definition.mycorp_assessmentsectiondefinition_AssessmentDef) {
   let section = newentity("mycorp_assessmentsection");
   section.mycorp_assessmentid = assessment;
   section.mycorp_assessmentsectiondefinitionid = sectionDef;
   section.mycorp_name = section.mycorp_name;
   create(section);

   for(let questionDef of sectionDef.mycorp_assessmentquestiondefinition_Section) {
      let question = newentity("mycorp_assessmentquestion");
      question.mycorp_assessmentsectionid = section;
      question.mycorp_questiondefinitionid = questionDef;
      create(question);
   }
}

setOutputEntityReference("CreatedAssessmentId", assessment);
```


## Available Plugin Types

Supports (tested) messages: `Create`, `Update`, `Delete`, `<custom API message for row scoped API>` for all of below.

Post-operation events must supply a pre-image named "PreImage" with all attributes. This is to allow change detection.

### DvJs.JavascriptCodePlugin
The Javascript script to execute should be placed in the unsecure configuration for the plugin step.

### DvJs.JavascriptCodeFromWebResourcePlugin
The unique name of of a web resource should be placed in the unsecure configuration. The web resource should contain the Javascript script to be executed will be read from the contents of this web resource.

## Available Workflow Activity Types

### DvJs.JavascriptCodeActivity
The Javascript script to execute should be placed in the "Script" input parameter for the activity. The results of evaluation are available as a string in the "Result" output parameter. So this can be used to do calcuations in Workflows as well as taking advanced actions.

### DvJs.JavascriptCodeFromWebResourceActivity
The Javascript script to execute should be placed in the web resource content and the reference to that web resource placed in the "Web Resource" input parameter. The results of evaluation are available as a string in the "Result" output parameter. So this can be used to do calcuations in Workflows as well as taking advanced actions.


## Script API

### Globals
- `context` - For advanced usage, object containing the following properties:
  
   - `executionContext` - The [IExecutionContext](https://learn.microsoft.com/en-us/dotnet/api/microsoft.xrm.sdk.iexecutioncontext?view=dataverse-sdk-latest) instance for the plugin step or workflow activity invocation. Allows advanced scenarios that need more services than available by default in the context object provided.
  
    - `organizationService` - The [IOrganizationService](https://learn.microsoft.com/en-us/dotnet/api/microsoft.xrm.sdk.iorganizationservice?view=dataverse-sdk-latest) instance for the plugin step or workflow activity invocation using the identify that is configured in the plugin step. Allows advanced interaction with Dataverse.
  
    - `tracingService` - The [ITracingService](https://learn.microsoft.com/en-us/dotnet/api/microsoft.xrm.sdk.itracingservice?view=dataverse-sdk-latest) instance for the plugin step or workflow activity invocation.
 
- `target` - A `EntityScriptObject` instance representing the primary row for which plugin step or workflow activity triggered. If the script is registered as a plugin step in the pre-operation stage for Create/Update message it can be modified before the create/update occurs and the changes will be saved automatically by the platform.

- `require(webResourceName)` Loads and evaluates JavaScript (or JSON) from the web resource with unique name `webResourceName` and returns the resulting value if any. Can be used for re-use of code or to load data from JSON files.

- `newentity(logicalName)` Creates a new instance of `EntityScriptObject` for the specified entity (table). Does not actually save the new row. Call `create()` below to do that.

- `create(entityScriptObject)` Saves the provided `EntityScriptObject` as a new row using the Create Dataverse operation. Updates the `Id` property with the resulting primary key value.

- `update(entityScriptObject)` Saves the provided `EntityScriptObject` row using the Update Dataverse operation. Only modified columns are included in the update.

- `delete(entityScriptObject)` Deletes the provided `EntityScriptObject` row using the Delete Dataverse operation.

- `envvar(envVarName)` Gets the value of the specified environment variable.

- `retrieve(entityName, id)` Retrieves a `EntityScriptObject` representing a single retrieved row for the specified `entityName` and `id`. All columns are retrieved.

- `reload(entityScriptObject)` Gets the latest version of the row represented by the `EntityScriptObject` from Dataverse and returns it. Does not update the provided instance.

- `setOutputEntityReference(parameterName, entityScriptObject)` For custom APIs. Sets the output parameter with the specified name, using the `EntityReference` type.

- `action(entityScriptObject, actionName)` Invokes a Dataverse row-scoped custom action and returns the resulting output parameters. Currently input parameters other than the target cannot specified.

### `EntityScriptObject` type

Instances of this type represent a single Dataverse row.

You can access the column values and relationships associated with this row using `instance.abc_logicalName` to either read or write the value.

|Column Type|Handling and returned/expected value|
|----|---------|
|Lookup|When reading, lazy loads the associated row if not already loaded and returns it as another `EntityScriptObject` instance or `null` if there is no associated record. When writing, set this to the `EntityScriptObject`.|
|"many" Relationships|Array of `EntityScriptObject` instances representing the related records. Read-only currently.|
|Option set values (choice)|The `Number` representing the selected choice, or `null`.|
|Money|`Number`|
|Text|`String`|
|DateTime|.NET `DateTime` instance|
|Everything else|As per the SDK|

Changes are automatically tracked and only the modified columns will be submitted when using the global `update` method above.

Additional properties:
- `Id` The primary key value as a string. If unsaved a "zero" GUID.
- `EntityName` The logical entity (table) name.
