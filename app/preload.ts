import { contextBridge, ipcRenderer } from 'electron';

// NOTE: Preload runs in sandboxed env - can't import local modules!
// All constants must be self-contained in this file.

const CHANNELS = {
  WINDOW_HIDE: 'window-hide',
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_CLOSE: 'window-close',
  SET_AUTO_LAUNCH: 'set-auto-launch',
  GET_AUTO_LAUNCH: 'get-auto-launch',
  GET_CONFIG: 'get-config-json-async',
  UPDATE_CONFIG: 'update-config-json-async',
  SELECT_SAVE_DIRECTORY: 'select-save-directory',
  CREATE_NOTE: 'create-note-async',
  READ_NOTE: 'read-note-async',
  WRITE_NOTE: 'write-note-async',
  GET_NOTE_GROUPS: 'get-note-groups-async',
  UPDATE_GROUPS_CONFIG: 'update-groups-config-async',
  DELETE_GROUP: 'delete-group-async',
  DELETE_NOTE_IN_GROUP: 'delete-note-in-group-async',
  RENAME_NOTE: 'rename-note-async',
  RENAME_GROUP: 'rename-group-async',
  UPDATE_NOTE_TAGS: 'update-note-tags-async',
  INIT_GITHUB: 'init-github',
  PUSH_TO_GITHUB: 'push-to-github',
  GET_GIT_URL: 'get-git-url',
};

// Safely wrap IPC invoke with error handling
function safeInvoke(channel: string, ...args: unknown[]): Promise<unknown> {
  return ipcRenderer.invoke(channel, ...args).catch((err: Error) => {
    console.error(`[preload] IPC invoke failed for "${channel}":`, err);
    return undefined;
  });
}

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send(CHANNELS.WINDOW_MINIMIZE),
  closeWindow: () => ipcRenderer.send(CHANNELS.WINDOW_CLOSE),
  hideWindow: () => ipcRenderer.send(CHANNELS.WINDOW_HIDE),

  // Auto launch
  setAutoLaunch: (checked: boolean) => safeInvoke(CHANNELS.SET_AUTO_LAUNCH, checked),
  getAutoLaunch: () => safeInvoke(CHANNELS.GET_AUTO_LAUNCH),

  // Config
  selectSaveDirectory: (defaultPath?: string) => safeInvoke(CHANNELS.SELECT_SAVE_DIRECTORY, defaultPath),
  getConfigJsonAsync: (force?: boolean) => safeInvoke(CHANNELS.GET_CONFIG, force),
  updateConfigJsonAsync: (newConfig: Record<string, unknown>) => safeInvoke(CHANNELS.UPDATE_CONFIG, newConfig),

  // Note groups
  getNoteGroupsAsync: (saveDir: string) => safeInvoke(CHANNELS.GET_NOTE_GROUPS, saveDir),
  updateGroupsConfigAsync: (newGroupsConfig: unknown) => safeInvoke(CHANNELS.UPDATE_GROUPS_CONFIG, newGroupsConfig),

  // Notes CRUD
  createNoteAsync: (options: { paths: string[]; type: string; content?: string }) =>
    safeInvoke(CHANNELS.CREATE_NOTE, options),
  readNoteAsync: (noteKey: string) => safeInvoke(CHANNELS.READ_NOTE, noteKey),
  writeNoteAsync: (noteKey: string, content: string) => safeInvoke(CHANNELS.WRITE_NOTE, noteKey, content),

  // Delete
  deleteGroupAsync: (groupKey: string) => safeInvoke(CHANNELS.DELETE_GROUP, groupKey),
  deleteNoteInGroupAsync: (noteKey: string) => safeInvoke(CHANNELS.DELETE_NOTE_IN_GROUP, noteKey),

  // Rename
  renameNoteAsync: (noteKey: string, newName: string) => safeInvoke(CHANNELS.RENAME_NOTE, noteKey, newName),
  renameGroupAsync: (groupKey: string, newName: string) => safeInvoke(CHANNELS.RENAME_GROUP, groupKey, newName),

  // Tags
  updateNoteTagsAsync: (noteKey: string, tags: string[]) => safeInvoke(CHANNELS.UPDATE_NOTE_TAGS, noteKey, tags),

  // GitHub sync
  initGitHubAsync: (gitUrl: string) => safeInvoke(CHANNELS.INIT_GITHUB, gitUrl),
  pushToGitHubAsync: () => safeInvoke(CHANNELS.PUSH_TO_GITHUB),
  getGitRemoteUrlAsync: () => safeInvoke(CHANNELS.GET_GIT_URL),
});
