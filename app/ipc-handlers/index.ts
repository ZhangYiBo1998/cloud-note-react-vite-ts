import { registerWindowHandlers } from './window';
import { registerConfigHandlers } from './config';
import { registerNotesHandlers } from './notes';
import { registerGroupsHandlers } from './groups';
import { registerGitHubHandlers } from './github';

export function registerAllHandlers(): void {
  registerWindowHandlers();
  registerConfigHandlers();
  registerNotesHandlers();
  registerGroupsHandlers();
  registerGitHubHandlers();
}
