import { prisma } from "@/lib/prisma";
import { constants,  } from "node:http2";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { accounts: { select: { provider: true, access_token: true } } },
   });

   if (user) {
      (user as any).account = user.accounts[0];
      // @ts-ignore
      delete user.accounts;
      return NextResponse.json(user);
   }


   return new Response("User not found", {
      status: constants.HTTP_STATUS_NOT_FOUND,
   });
}