interface TRepoTimeTracking {
  vscodeTime: number;
  codeTime: number;
  kpm: number;
}
export interface TimeTracking {
  id: number | null;
  KPM: number;
  vscodeTime: number;
  codeTime: number;
  repos: Record<string, TRepoTimeTracking>[];
}
