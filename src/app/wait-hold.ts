export interface WaitHold {
  id: string;
  category: string;
  created: Date;
  updated: Date;
  status: string;
  name: string;
  email: string;
  tool: string;
  notes?: string;
  holdExpiration: Date | null;
}
