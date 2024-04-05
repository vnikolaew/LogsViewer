"use client";
import React, { PropsWithChildren } from "react";
import { CookiesProvider as CProvider } from "react-cookie";

const CookiesProvider = ({ children }: PropsWithChildren) => {
   return (
      <CProvider defaultSetOptions={{ sameSite: `none`, httpOnly: false, maxAge: 60 * 60 * 1000  }}>
         {children}
      </CProvider>
   );
};

export default CookiesProvider;