import type {Dispatch, SetStateAction} from "react";

/** 外观/行为可持久化设置 */
export interface ISettings {
    theme: string;
    closeType: 'hide' | 'quit';
}

/** 外观/行为设置上下文值 */
export interface ISettingsContextValue {
    settings: ISettings,
    setSettings: Dispatch<SetStateAction<ISettings>>;
}

/** 应用配置上下文值 */
export interface IConfigContextValue {
    config: IConfigData;
    setConfig: Dispatch<SetStateAction<IConfigData>>;
}

/** config.json 数据结构 */
export interface IConfigData {
    saveDirectory?: string;
    closeType?: 'hide' | 'quit';
    theme?: 'light' | 'dark';
    backupDirectory?: string;
    backupIntervalMinutes?: number;
    globalShortcut?: string;
    devToolsShortcut?: string;
}

/** 分组/笔记通用字段 */
export interface ICommonItem {
    key: string;
    name: string;
    createTime: number;
    updateTime: number;
}

/** 笔记条目（属于某个分组 children 的子元素） */
export interface INoteItem extends ICommonItem {
    tags: string[];
}

/** 分组条目，可包含子笔记 */
export interface IGroupsItem extends ICommonItem {
    children: INoteItem[];
}

/** groups.json 文件结构 */
export interface IGroupsConfig {
    groups?: IGroupsItem[];
}

/** 扁平化后的笔记映射条目（含 parent 分组名 + type: 'file'） */
export interface INoteItemMap extends INoteItem {
    type: 'file';
    parent: string
}

/** 扁平化后的分组映射条目（type: 'group'） */
export interface IGroupsItemMap extends IGroupsItem {
    type: 'group';
    parent: null | undefined;
}

/** key → INoteItemMap|IGroupsItemMap 的快速查找表 */
export interface IGroupsMap {
    [key: string]: INoteItemMap | IGroupsItemMap;
}

/** 笔记分组状态上下文值 */
export interface IGroupsContextValue {
    groupsConfig: IGroupsConfig,
    setGroupsConfig: Dispatch<SetStateAction<IGroupsConfig>>;
    groupsMap: IGroupsMap;
}

/** 创建笔记/分组时传给主进程的选项 */
export interface ICreateNoteOptions {
    paths: string[];
    type: 'file' | 'group';
    content?: string;
}

/** 侧边栏宽度/折叠状态上下文值 */
export interface ISidebarContextValue {
    width: number;
    collapsed: boolean;
    toggleCollapse: () => void;
    onDragStart: (e: React.MouseEvent) => void;
    isResizing: boolean;
}