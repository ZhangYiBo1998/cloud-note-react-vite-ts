import {createContext, type Dispatch, type SetStateAction} from 'react';

export interface ISettings {
    theme: string;
    closeType: 'hide' | 'quit';
}
export interface ISettingsContext {
    settings: ISettings,
    setSettings: Dispatch<SetStateAction<ISettings>>;
}

export const SettingsContext = createContext<ISettingsContext>({} as ISettingsContext);