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

interface IMenuItemChildrenItem {
    createTime: number;
    updateTime: number;
}

export interface IMenuItem {
    key: string;
    label: string;
    children?: (IMenuItemChildrenItem & IMenuItem)[];
};

export type IGroupsContextValue = {
    groups?: IMenuItem[];
};