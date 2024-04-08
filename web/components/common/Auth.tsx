"use client";
import React, { Fragment, PropsWithChildren } from "react";
import { useSession } from "next-auth/react";

const Auth = ({ children }: PropsWithChildren) => {
   const session = useSession();
   if (!session || session.status === `unauthenticated`) {
      return null;
   }

   return <Fragment>{children}</Fragment>;
};

export default Auth;