import { User } from "./Users";

export interface Codetime {
  id: number;
  eventType: string;
  identifier: string | null;
  createdAt: string;
  projectDirectory: string | null;
  projectName: string | null;
  authorName: string | null;
  authorEmail: string | null;
  repoName: string | null;
  gitBranch: string | null;
  gitTag: string | null;
  start: number;
  end: number;
  fileName: string;
  filePath: string;
  lang: string | null;
  codeQuality: string | null;
  lineCount: number;
  characterCount: number;
  syntax: string | null;
  keystrokes: number;
  linesAdded: number;
  linesDeleted: number;
  charactersAdded: number;
  charactersDeleted: number;
  autoIndents: number;
  replacements: number;
  editorName: string | null;
  editorVersion: string | null;
  creatorId: number;
  creator: User;
  blankLine: number;
}
