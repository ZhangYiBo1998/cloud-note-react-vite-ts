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

export interface ICommonItem {
    key: string;
    name: string;
    createTime: number;
    updateTime: number;
}

export interface INoteItem extends ICommonItem {
    tags: string[];
}

export interface IGroupsItem extends ICommonItem {
    children: INoteItem[];
}

export interface IGroupsConfig {
    groups?: IGroupsItem[];
}

export interface INoteItemMap extends INoteItem {
    type: 'file';
    parent: string
}

export interface IGroupsItemMap extends IGroupsItem {
    type: 'group';
    parent: null | undefined;
}

export interface IGroupsMap {
    [key: string]: INoteItemMap | IGroupsItemMap;
}

export interface IGroupsContextValue {
    groupsConfig: IGroupsConfig,
    setGroupsConfig: Dispatch<SetStateAction<IGroupsConfig>>;
    groupsMap: IGroupsMap;
}

export interface ICreateNoteOptions {
    paths: string[];
    type: 'file' | 'group';
    content?: string;
}