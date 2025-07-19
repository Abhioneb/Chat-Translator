import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      /** The user’s database ID */
      id: string;
    } & DefaultSession["user"];
  }

  // If you ever reference `user.id` (e.g. in callbacks), ensure the User type has it
  interface User extends DefaultUser {
    id: string;
  }
}
