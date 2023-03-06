import { Configuration, LogLevel } from "@azure/msal-node";

const msalConfig : Configuration = {
    auth: {
        clientId: <string> process.env.CLIENT_ID, // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
        authority: <string> process.env.AUTHORITY, // Full directory URL, in the form of https://login.microsoftonline.com/<tenant>
        clientSecret: process.env.CLIENT_SECRET // Client secret generated from the app registration in Azure portal,      
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel: LogLevel | undefined, message: string, containsPii: boolean) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel:  LogLevel.Info,
        }
    }
}


export {
    msalConfig,
};