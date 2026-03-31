export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  aiToken: string;
  createdAt: Date;
  updatedAt: Date;
}
