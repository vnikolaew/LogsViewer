import Home from "@/components/home";
import Sidebar from "@/components/sidebar";
import React from "react";
import { getUserSession } from "@/lib/session";
import UserInfo from "@/components/home/UserInfo";
import { getCsrfToken, getProviders } from "next-auth/react";

export default async function Page() {
   const user = await getUserSession();
   const token = await getCsrfToken();
   const providers = await getProviders()

   return (
      <main className="flex min-h-[80vh] flex-col items-start justify-start p-4 mt-4">
         <div className={`grid gap-8 md:grid-cols-9 2xl:grid-cols-12 w-full`}>
            <div className={`md:col-span-2 2xl:col-span-2`}>
               <Sidebar />
            </div>
            <div className={`md:col-span-7 col-span-10 flex flex-col items-center`}>
               <UserInfo providers={providers} token={token} user={user} />
               <Home />
            </div>
         </div>
      </main>
   );
}
