export interface WaitHold {
  id: string;
  category: string;
  created: Date;
  updated: Date;
  status: string;
  name: string;
  email: string;
  tool: string;
  holdExpiration: Date | null;
}
