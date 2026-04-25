import {createContext} from 'react';
import type {ISettingsContextValue, IConfigContextValue, IGroupsContextValue} from "../types";

export const SettingsContext = createContext<ISettingsContextValue>({} as ISettingsContextValue);

export const ConfigContext = createContext<IConfigContextValue>({} as IConfigContextValue)

export const GroupsContext = createContext<IGroupsContextValue>({} as IGroupsContextValue)