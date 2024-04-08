import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import React from "react";
import Email from "@/emails";
import { constants } from "node:http2";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";

const mailerSend = new MailerSend({
   apiKey: process.env.MAILERSEND_API_KEY!,
})

export async function POST(request: NextRequest) {
   const emailHtml = render(React.createElement(Email, {}));

   const emailParams = new EmailParams()
      .setFrom(new Sender(`info@trial-neqvygm99xwl0p7w.mlsender.net`))
      .setTo( [new Recipient(`victorio.nikolaev25@gmail.com`)])
      .setSubject(`Test mail`)
      .setHtml(emailHtml)

   const response = await mailerSend.email.send(emailParams)
   console.log({ response });
   if (response.statusCode <= 400) return NextResponse.json("OK");

   return new Response("Bad request", {
      status: constants.HTTP_STATUS_BAD_REQUEST,
   });
}