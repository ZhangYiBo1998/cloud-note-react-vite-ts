import type {Dispatch, SetStateAction} from "react";
import type {MenuProps} from "antd";

export interface ISettings {
    theme: string;
    closeType: 'hide' | 'quit';
}
export interface ISettingsContextValue {
    settings: ISettings,
    setSettings: Dispatch<SetStateAction<ISettings>>;
}

export interface IConfigContextValue {
    saveDirectory?: string;
}

type MenuItem = Required<MenuProps>['items'][number];

export type IGroupsContextValue = {
    groups: MenuItem[];
};