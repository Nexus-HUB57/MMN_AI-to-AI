export interface TrpcContext {
  user?: {
    id: number;
    openId: string;
    email: string;
    name: string;
    loginMethod: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
    lastSignedIn: Date;
  };
  req: {
    protocol: string;
    headers: Record<string, string | string[] | undefined>;
  };
  res: {
    clearCookie: (name: string, options?: any) => void;
  };
}
