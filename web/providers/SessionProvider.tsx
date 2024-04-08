'use client'
import React, { PropsWithChildren } from "react";
import { SessionProvider as SProvider } from "next-auth/react";

const SessionProvider = ({children} : PropsWithChildren) => {
   return (
      <SProvider refetchOnWindowFocus>
         {children}
      </SProvider>
   );
};

export default SessionProvider;