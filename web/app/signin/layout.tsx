import React, { PropsWithChildren } from "react";
import { getUserSession } from "@/lib/session";
import { redirect } from "next/navigation";

const Layout = async ({ children }: PropsWithChildren) => {
   const session = await getUserSession();
   if (session) {
      redirect(`/`);
   }

   return (
      <section>
         {children}
      </section>
   );
};

export default Layout;