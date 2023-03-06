export default interface Config {
    [id: string]: ControlConfig;
}

export interface ControlConfig {
    visible: Rule<boolean>;
    required: Rule<boolean>;
    disabled: Rule<boolean>

    [property: string]: Rule<any>;
}

export interface State {
    [id: string]: ControlState;
}

export interface ControlState {
    visible: boolean;
    value: string;
    required: boolean;
    disabled: boolean;
}

export type Rule<T> = string | ((state: any) => T);
