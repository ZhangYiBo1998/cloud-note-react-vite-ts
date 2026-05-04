/**
 * React Context 定义
 *
 * 五个全局上下文：
 * - SettingsContext：外观主题、关闭行为、左面板模式
 * - ConfigContext：应用配置（存档目录、备份设置等），由 App.tsx 初始化
 * - GroupsContext：笔记分组/内容数据，兼顾配置和运行时状态
 * - SidebarContext：侧边栏宽度/折叠状态
 * - MemoFilterContext：备忘列表过滤状态（标签/分组选择）
 */
import {createContext} from 'react';
import type {ISettingsContextValue, IConfigContextValue, IGroupsContextValue, ISidebarContextValue, IMemoFilterContextValue} from "../types";

/** 外观/行为设置 */
export const SettingsContext = createContext<ISettingsContextValue>({} as ISettingsContextValue);

/** 应用配置（config.json 缓存） */
export const ConfigContext = createContext<IConfigContextValue>({} as IConfigContextValue)

/** 笔记分组/内容状态 */
export const GroupsContext = createContext<IGroupsContextValue>({} as IGroupsContextValue)

/** 侧边栏宽度/折叠状态 */
export const SidebarContext = createContext<ISidebarContextValue>({} as ISidebarContextValue)

/** 备忘列表过滤状态 */
export const MemoFilterContext = createContext<IMemoFilterContextValue>({} as IMemoFilterContextValue)