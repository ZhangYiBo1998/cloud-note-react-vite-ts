import {createContext} from 'react';
import {ISettingsContextValue, IConfigContextValue, IGroupsContextValue} from "../types";

export const SettingsContext = createContext<ISettingsContextValue>({} as ISettingsContextValue);

export const ConfigContext = createContext<IConfigContextValue>({})

export const GroupsContext = createContext<IGroupsContextValue>({})