import { User, getServerSession, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

export const session = async ({ session, token, ...rest }: | {
   session: Session
   token: JWT
   user: AdapterUser
} & {
   newSession: any
   trigger: "update"
}) => {
   (session.user as any).id = token.id;
   return session;
};

export const getUserSession = async (): Promise<User> => {
   const authUserSession = await getServerSession({
      callbacks: {
         session,
      },
   });

   // if (!authUserSession) throw new Error('unauthorized')
   return authUserSession?.user as User;
};