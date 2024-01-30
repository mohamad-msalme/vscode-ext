import { User } from "./Users";

export interface Organization {
  id: number;
  orgName: string;
  displayName: string | null;
  createdAt: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;
  telephone: string | null;
  email: string | null;
  website: string | null;
  users: User[];
}
