import { describe, expect, test } from '@jest/globals';
import PLazy from 'p-lazy';
import { init } from './dvjs';
import { retrieve, retrieveMultiple, WebApiConfig,  } from 'dataverse-webapi/lib/node';

import {
    msalConfig,
} from './testAuthConfig';
import { ConfidentialClientApplication } from '@azure/msal-node'

describe('dvjs', () => {



    test('test1', async () => {

        let app = new ConfidentialClientApplication(msalConfig);
        let token = await app.acquireTokenByClientCredential({scopes: [process.env.ENVIRONMENT_URL + '/.default']});
        const apiConfig = new WebApiConfig("9.2", token?.accessToken, process.env.ENVIRONMENT_URL);

        let rootEntity = await retrieve(apiConfig, "rnwood_dvjsbusinessrulestesttables", "cdf7acc7-80b6-ed11-83ff-0022489f7cc6")

        let p = LazyResult.forRoot(rootEntity, apiConfig);

        expect(p.then).toBeDefined()
        expect(typeof (p.then)).toBe("function");
        expect(await p).toBe(rootEntity);

        expect(p.rnwood_name.then).toBeDefined()
        expect(typeof (p.rnwood_name.then)).toBe("function");
        expect(await p.rnwood_name).toBe("rob");

        expect(p.rnwood_anotherrecordid.rnwood_name.then).toBeDefined()
        expect(typeof (p.rnwood_anotherrecordid.rnwood_name.then)).toBe("function");
        expect(await p.rnwood_anotherrecordid.rnwood_name).toBe("rob2");

    });


    class LazyResultProxyHandler implements ProxyHandler<LazyResult> {

        constructor(apiConfig: WebApiConfig) {
            this.apiConfig = apiConfig;
        }

        readonly apiConfig: WebApiConfig;


        get(target: LazyResult, p: string | symbol, receiver: any): any {

            if (p == "then") {

                let promise = new PLazy((resolve) => resolve(target.resolve()));
                return promise.then.bind(promise);
            }

            if (Reflect.has(target, p)) {
                return Reflect.get(target, p, receiver);
            }

            return LazyResult.forChild(target, String(p), this.apiConfig);
        }


    }

    class LazyResult {

        private constructor(options: { parent: LazyResult | null } | { root: any }, columnName: string | null, apiConfig: WebApiConfig) {

            if ("parent" in options) {
                this.parent = options.parent;
            } else {
                this.root = options.root;
            }
            this.columnName = columnName;
            this.apiConfig = apiConfig;
        }

        readonly columnName: string | null = null;
        readonly parent: LazyResult | null = null;
        readonly root: any | null = null;
        readonly apiConfig:WebApiConfig;

        async resolve(): Promise<any> {

            let parentValue: any = null;
            if (this.root) {
                return this.root;
            } else if (this.parent) {
                parentValue = await this.parent.resolve();
            }

            if (!parentValue) {
                return Promise.resolve(null);
            }

            const lookupTargetPropName = `_${this.columnName}_value@Microsoft.Dynamics.CRM.lookuplogicalname`;
            if (Reflect.has(parentValue, lookupTargetPropName)) {
                const lookupIdPropName = `_${this.columnName}_value`;
                const lookupId = parentValue[lookupIdPropName];
                const lookupTarget = parentValue[lookupTargetPropName];

                const entityResults = await retrieveMultiple(this.apiConfig, "EntityDefinitions", `$filter=LogicalName eq '${lookupTarget}'&$select=EntitySetName`)
                const entitySetName = <string> entityResults.value[0].EntitySetName;

                const otherRecord = await retrieve(this.apiConfig, entitySetName, lookupId);

                if (!otherRecord) {
                    return null;
                }

                return otherRecord;
            }
        /*
_rnwood_anotherrecordid_value:
'edf92191-41b7-ed11-83ff-0022489f7cc6'
_rnwood_anotherrecordid_value@Microsoft.Dynamics.CRM.associatednavigationproperty:
'rnwood_AnotherRecordId'
_rnwood_anotherrecordid_value@Microsoft.Dynamics.CRM.lookuplogicalname:
'rnwood_dvjsbusinessrulestesttable'
_rnwood_anotherrecordid_value@OData.Community.Display.V1.FormattedValue:
'rob2'
*/

            return Promise.resolve(parentValue ? parentValue[<string>this.columnName] : null);
        }

        [key: string]: any;

        static forRoot(root: any, apiConfig: WebApiConfig) {
            return this.create({ root: root }, null, apiConfig);
        }

        static forChild(parent: LazyResult, columnName: string, apiConfig: WebApiConfig) {
            return this.create({ parent: parent }, columnName, apiConfig);
        }

        private static create(options: { parent: LazyResult | null } | { root: any | null }, columnName: string | null, apiConfig: WebApiConfig): LazyResult {
            let innerObj = new LazyResult(options, columnName, apiConfig);
            return new Proxy(innerObj, new LazyResultProxyHandler(apiConfig));
        }

    }


});