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
    name: string;
    createTime: number;
    updateTime: number;
    tags?: string[];
    children?: IMenuItem[];
}

export interface INoteInfoMap extends IMenuItem {
    content: string;
    type: 'file' | 'group';
    parent?: string
}

export interface IGroupsConfig {
    groups?: IMenuItem[];
}

export interface IGroupsContextValue {
    groupsConfig: IGroupsConfig,
    setGroupsConfig: Dispatch<SetStateAction<IGroupsConfig>>;
}

export interface ICreateNoteOptions {
    paths: string[];
    content?: string;
    type?: 'file' | 'group'
}