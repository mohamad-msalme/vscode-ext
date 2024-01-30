import { Codetime } from "./Codetime";
import { Organization } from "./Organization";

export interface User {
  id: number;
  email: string | null;
  displayName: string | null;
  company: string | null;
  address: string | null;
  telephone: string | null;
  website: string | null;
  createdAt: string;
  pwd: string | null;
  githubId: string | null;
  googleId: string | null;
  azureId: string | null;
  orgId: number | null;
  org: Organization;
  codetimes: Codetime[];
}
