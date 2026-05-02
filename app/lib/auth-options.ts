import Google from "next-auth/providers/google";
import { prisma } from "@/app/lib/db";

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google" && user.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split("@")[0],
              avatar: user.image,
              role: "BUSINESS",
            },
          });
        }
      }

      return true;
    },
    async jwt({ token, user, account }: any) {
      if (account) {
        token.provider = account.provider;
        token.providerId = account.providerAccountId;
      }

      if (user || !token.businessId) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          include: { business: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.businessId = dbUser.business?.id || null;
          token.businessName = dbUser.business?.name || null;
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.businessId = token.businessId;
        session.user.businessName = token.businessName;
      }

      return session;
    },
  },
  pages: {
    signIn: "/dang-nhap",
  },
  session: {
    strategy: "jwt" as const,
  },
};
