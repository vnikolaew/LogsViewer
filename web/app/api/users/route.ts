import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, res: NextResponse) {
   const users = await prisma.user
      .findMany({ include: { accounts: { select: { provider: true, access_token: true } } } });

   if (users.length > 0) {
      return NextResponse.json(users);
   }

   return NextResponse.json("No users found");
}