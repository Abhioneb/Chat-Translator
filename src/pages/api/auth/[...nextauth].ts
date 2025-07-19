import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export default NextAuth({
  // 1) Use Prisma to persist users & sessions in your SQLite/Postgres DB
  adapter: PrismaAdapter(prisma),

  // 2) Register OAuth providers
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!, // not maintained in .env.local
    }),
  ],

  // 3) Store sessions in the database (not JWT-only)
  session: { strategy: 'database' },

  // 4) Encrypt session data
  secret: process.env.NEXTAUTH_SECRET,

  // 5) Callback to include the Prisma user.id on `session.user`
  callbacks: {
    async session({ session, user }) {
      // Makes `session.user.id` available in the client
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
