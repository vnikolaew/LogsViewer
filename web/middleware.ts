import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
   // `withAuth` augments your `Request` with the user's token.
   async function middleware(req) {
   },
   {
      callbacks: {

      },
      pages: {
         signIn: `/signin`,
         error: `/error`,
      },
   },
);

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };