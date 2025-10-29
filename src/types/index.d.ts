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

export interface INoteItem {
    key: string;
    name: string;
    createTime: number;
    updateTime: number;
    tags: string[];
}

export interface IGroupsItem {
    key: string;
    name: string;
    createTime: number;
    updateTime: number;
    children: INoteItem[];
}

export interface INoteInfoMap extends INoteItem {
    content: string;
    type: 'file' | 'group';
    parent?: string
}

export interface IGroupsConfig {
    groups?: IGroupsItem[];
}

export interface IGroupsContextValue {
    groupsConfig: IGroupsConfig,
    setGroupsConfig: Dispatch<SetStateAction<IGroupsConfig>>;
    groupsMap: { [key: string]: any }
}

export interface ICreateNoteOptions {
    paths: string[];
    content?: string;
    type?: 'file' | 'group'
}