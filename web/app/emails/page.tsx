"use client";
import React from "react";
import { render } from "@react-email/render";
import Email from "@/emails";

const Page = () => {

   async function handleSendMail() {
      const res = await fetch(`/api/email`, { method: "POST" });
      const body = await res.json();
      console.log({ body });
   }

   return (
      <div className={`mx-12 my-4 min-h-[70vh]`}>
         <h2>
            E-mails Page
         </h2>
         <p>
            {render(<Email />, { pretty: true, plainText: true })}
         </p>
         <button onClick={handleSendMail} className={`btn btn-sm btn-ghost`}>Send mail</button>
      </div>
   );
};

export default Page;