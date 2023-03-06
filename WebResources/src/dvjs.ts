import Config, { State, Rule, ControlConfig, ControlState } from "./config";
import * as mobx from "mobx";

type ControlType = Xrm.Controls.Control | Xrm.Controls.Tab | Xrm.Controls.Section;
type ControlsType = { [id: string]: ControlType };

type Property<T> = {
    name: string;
    getRule: (c: ControlConfig) => Rule<T>;
    getFromControl: (c: ControlType) => T;
    setToControl: (c: ControlType, v: T) => void;
    setState: (s: ControlState, v: T) => void;
    getState: (s: ControlState) => T;
    addWatcher: null | ((c: ControlType, h: () => void) => void);
};

const properties: Property<any>[] = [
    {
        name: "visible",
        getRule: (c) => c.visible,
        getFromControl: (c) => c.getVisible(),
        setToControl: (c, v) => (<Xrm.Controls.StandardControl>c).setVisible?.call(c, v),
        setState: (s, v) => (s.visible = v),
        getState: (s) => s.visible,
        addWatcher: null,
    },
    {
        name: "required",
        getRule: (c) => c.required,
        getFromControl: (c) => {
             const requiredLevel = (<Xrm.Controls.StandardControl>c).getAttribute?.call(c)?.getRequiredLevel();
             return requiredLevel == "required";
        },
        setToControl: (c, v) => (<Xrm.Controls.StandardControl>c).getAttribute?.call(c).setRequiredLevel(v ? "required" : "none"),
        setState: (s, v) => (s.required = v),
        getState: (s) => s.required,
        addWatcher: null,
    },
    {
        name: "disabled",
        getRule: (c) => c.disabled,
        getFromControl: (c) => !!(<Xrm.Controls.StandardControl>c).getDisabled?.call(c),
        setToControl: (c, v) => (<Xrm.Controls.StandardControl>c).setDisabled(v),
        setState: (s, v) => (s.disabled = v),
        getState: (s) => s.disabled,
        addWatcher: null,
    },
    {
        name: "value",
        getRule: (c) => c.value,
        getFromControl: (c) => (<Xrm.Controls.StandardControl>c).getAttribute?.call(c)?.getValue(),
        setToControl: (c, v) => (<Xrm.Controls.StandardControl>c).getAttribute?.call(c)?.setValue?.call(c, v),
        setState: (s, v) => (s.value = v),
        getState: (s) => s.value,
        addWatcher: (c, h) => {
            const attribute = (<Xrm.Controls.StandardControl>c).getAttribute?.call(c);
            attribute?.addOnChange?.call(attribute, h);
        },
    }
    
];

export async function init(context: Xrm.Events.EventContext, configWebResourceName: string): Promise<void> {
    const formContext = context.getFormContext();

    try {
        Xrm.Utility.showProgressIndicator("Loading business rules...");

        const config = await loadConfig(context, configWebResourceName);

        const { controls, state } = getInitialState(formContext);
        mobx.makeAutoObservable(state);

        for (const id in config) {
            const control = controls[id];
            const controlConfig = config[id];
            const controlState = state[id];

            for (const property of properties) {
                mobx.autorun(() => {
                    try {
                        let functionOrString = property.getRule(controlConfig);
                        if (functionOrString) {
                            let fn: (s: State) => any;
                            if (typeof functionOrString === "string") {
                                fn = (s: State) => new Function("control", "return " + functionOrString)(s);
                            } else {
                                fn = functionOrString;
                            }

                            let newValue = fn(state);

                            let oldValue = property.getState(controlState);
                            if (newValue !== oldValue) {
                                console.info("DVJS control state updated by result", { control: control.getName(), property: property.name, value: newValue });
                                property.setState(controlState, newValue);
                                property.setToControl(control, newValue);
                                console.info("DVJS updated state", mobx.toJS(state));
                            }

                            formContext.ui.clearFormNotification(`dvjsrule.${id}.${property.name}`);
                            console.info("DVJS function executed", { control: id, property: property.name, result: newValue });
                        }
                    } catch (e: any) {
                        console.error("DVJS error in function execution", { control: id, property: property.name, error: e });
                        formContext.ui.setFormNotification(`Business rules error - ${id}.${property.name} - ${e.message}`, "ERROR", `dvjsrule.${id}.${property.name}`);
                        throw e;
                    }
                });
            }
        }

        Xrm.Utility.closeProgressIndicator();
    } catch (e: any) {
        console.error("DVJS loading error", e);
        Xrm.Utility.closeProgressIndicator();
        await Xrm.Navigation.openErrorDialog({ message: `Error loading business rules - ${e.message ?? "unknown error"}`, details: `DvJs error: ${e}` });
    }
}

function getInitialState(formContext: Xrm.FormContext): { state: State; controls: ControlsType } {
    const state: State = {};
    let initialStateLoaded = false;

    const controls: ControlsType = {};
    formContext.ui.controls.forEach((c) => (controls[c.getName()] = c));

    formContext.ui.tabs.forEach((t) => {
        controls[t.getName()] = t;

        t.sections.forEach((s) => (controls[s.getName()] = s));
    });

    for (const controlName in controls) {
        const i = controls[controlName];
        state[i.getName()] = <any>{};

        for (const property of properties) {
            const propertyValue = property.getFromControl(i);
            property.setState(state[i.getName()], propertyValue);

            property.addWatcher?.call(property, i, () => {
                if (!initialStateLoaded) {
                    return;
                }
                const propertyValue = property.getFromControl(i);
                const oldvalue = property.getState(state[i.getName()]);

                if (propertyValue != oldvalue) {
                    mobx.runInAction(() => {
                        console.info("DVJS control state changed", { control: i.getName(), property: property.name, value: propertyValue });
                        property.setState(state[i.getName()], propertyValue);
                        console.info("DVJS updated state", mobx.toJS(state));
                    });
                }
            });
        }
    }

    console.info("DVJS initial state", mobx.toJS(state));

    initialStateLoaded = true;
    return { state: state, controls: controls };
}

async function loadConfig(context: Xrm.Events.EventContext, configWebResourceName: string) {
    const baseUrl = context.getContext().getClientUrl();

    let configScript = await (await fetch(baseUrl + "/webresources/" + configWebResourceName)).text();

    if (configScript.trim().startsWith("{")) {
        configScript = "return " + configScript;
    }
    return <Config>new Function(configScript)();
}
