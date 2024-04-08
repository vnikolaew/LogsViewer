import NextAuth, { NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { session } from "@/lib/session";
import { PrismaAdapter } from "@auth/prisma-adapter";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID !;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET !;


const credentialsProvider = CredentialsProvider({
   name: `credentials`,
   type: `credentials`,
   credentials: {
      email: { label: `Email`, type: `email`, placeholder: `sample@gmail.com` },
      password: { label: `Password`, type: `password`, placeholder: `Password` },
   },
   async authorize(credentials, req) {
      console.log({ credentials, req });

      const user = await prisma.user.findUnique({
         where: { email: credentials?.email },
      });

      if (user) {
         return {
            id: user.id!.toString()!,
            name: user.name,
            email: user.email,
            image: user.image,
         } as User;
      }

      return Promise.resolve<User>(null!);
   },
});

const authOptions: NextAuthOptions = {
   session: {
      strategy: `jwt`,
   },
   debug: true,
   // @ts-ignore
   adapter: PrismaAdapter(prisma),
   providers: [
      GoogleProvider({
         clientId: GOOGLE_CLIENT_ID,
         name: `google`,
         clientSecret: GOOGLE_CLIENT_SECRET,
         // allowDangerousEmailAccountLinking: true,
      }),
      GitHubProvider({
         name: `github`,
         clientId: GITHUB_CLIENT_ID,
         clientSecret: GITHUB_CLIENT_SECRET,
         // allowDangerousEmailAccountLinking: true,
      }),
   ],
   callbacks: {
      session,
      async jwt({ token, user, account, profile, session }) {
         if (profile) {
            const user = await prisma.user.findUnique({
               where: {
                  email: profile.email,
               },
            });

            if (!user) {
               throw new Error("No user found");
            }

            token.id = user.id;
            session ??= {};
            session.user ??= {};
            session.user.id = user.id;
         }

         return token;
      },
   },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };