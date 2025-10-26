import type {Dispatch, SetStateAction} from "react";

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

export interface IMenuItem {
    key: string;
    label: string;
    path: string;
    createTime: number;
    updateTime: number;
    type: 'file' | 'folder';
    children?: (IMenuItem & { tags: string[]; fileName: string })[];
}

export interface IGroupsConfig {
    groups?: IMenuItem[];
}

export interface IGroupsContextValue {
    groupsConfig: IGroupsConfig,
    setGroupsConfig: Dispatch<SetStateAction<IGroupsConfig>>;
}