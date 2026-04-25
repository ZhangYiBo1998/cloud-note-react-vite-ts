export const IPC_CHANNELS = {
  // Window controls
  WINDOW_HIDE: 'window-hide',
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_CLOSE: 'window-close',

  // Auto launch
  SET_AUTO_LAUNCH: 'set-auto-launch',
  GET_AUTO_LAUNCH: 'get-auto-launch',

  // Config
  GET_CONFIG: 'get-config-json-async',
  UPDATE_CONFIG: 'update-config-json-async',
  SELECT_SAVE_DIRECTORY: 'select-save-directory',

  // Notes
  CREATE_NOTE: 'create-note-async',
  READ_NOTE: 'read-note-async',
  WRITE_NOTE: 'write-note-async',

  // Groups
  GET_NOTE_GROUPS: 'get-note-groups-async',
  UPDATE_GROUPS_CONFIG: 'update-groups-config-async',
  DELETE_GROUP: 'delete-group-async',
  DELETE_NOTE_IN_GROUP: 'delete-note-in-group-async',
  RENAME_NOTE: 'rename-note-async',
  RENAME_GROUP: 'rename-group-async',
  UPDATE_NOTE_TAGS: 'update-note-tags-async',

  // GitHub sync
  INIT_GITHUB: 'init-github',
  PUSH_TO_GITHUB: 'push-to-github',
  GET_GIT_URL: 'get-git-url',

  // Backup
  PERFORM_BACKUP: 'perform-backup',
  GET_BACKUP_STATUS: 'get-backup-status',

  // Search
  SEARCH_NOTES: 'search-notes-async',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
