import NextAuth, { NextAuthOptions, User } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import GitHubProvider, { GithubProfile } from "next-auth/providers/github";
import LinkedInProvider, { LinkedInProfile } from "next-auth/providers/linkedin";
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
      LinkedInProvider({
         clientId: process.env.LINKEDIN_CLIENT_ID!,
         clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
         authorization: {
            params: { scope: `profile email openid` },
         },
         issuer: "https://www.linkedin.com",
         jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
         allowDangerousEmailAccountLinking: true,
         profile(profile: LinkedInProfile, tokens) {
            const defaultImage =
               "https://cdn-icons-png.flaticon.com/512/174/174857.png";

            console.log({ profile });
            return {
               id: profile.sub,
               name: profile.name,
               email: profile.email,
               image: profile.picture ?? defaultImage,
            };
         },
      }),
      GoogleProvider({
         clientId: GOOGLE_CLIENT_ID,
         name: `google`,
         clientSecret: GOOGLE_CLIENT_SECRET,
         profile(profile, tokens) {
            // console.log({ profile, tokens });
            return {
               id: profile.sub,
               name: profile.name,
               email: profile.email,
               image: profile.picture,
            };
         },
         // allowDangerousEmailAccountLinking: true,
      }),
      GitHubProvider({
         name: `github`,
         clientId: GITHUB_CLIENT_ID,
         clientSecret: GITHUB_CLIENT_SECRET,
         // allowDangerousEmailAccountLinking: true,
      }),
      credentialsProvider,
   ],
   callbacks: {
      session,
      signIn: async ({ user, account, profile, email, credentials }) => {
         if (profile) {
            const emailVerified = (profile as any).email_verified === true || (profile as any).email_verified === `true`;

            await prisma.user.update({
               where: { email: user.email },
               data: { emailVerified: emailVerified ? new Date() : undefined },
            });
         }

         return true;
      },
      async jwt({ token, user, account, profile, session }) {
         console.log({ profile, user });

         const email = profile?.email ?? user?.email;
         if (email) {
            const dbUser = await prisma.user.findUnique({
               where: {
                  email,
               },
            });

            if (!dbUser) {
               throw new Error("No user found");
            }

            console.log(`we are here`);
            token.id = dbUser.id;
            if (session) {
               session.user = {};
               session.user.id = dbUser.id;
               // Object.assign(session.user.id, dbUser.id);
            }

            return token;
         }
         return token;
      },
   },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };