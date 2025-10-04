export  interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
};

export type MeResponse = AuthUser;


