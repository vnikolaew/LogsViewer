import { NextRequest, NextResponse } from "next/server";
import { ChatAnthropic } from "@langchain/anthropic";

export async function GET(request: NextRequest) {
   const prompt = request.nextUrl.searchParams.get("prompt") ?? `How are you today?`;

   const chatModel = new ChatAnthropic({ temperature: 0.9 });
   const response = await chatModel.invoke(prompt);

   return NextResponse.json(response);
}