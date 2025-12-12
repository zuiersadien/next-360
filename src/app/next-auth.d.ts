import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    companies: { id: number; name: string }[];
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
      companies: { id: number; name: string }[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    companies: { id: number; name: string }[];
  }
}
