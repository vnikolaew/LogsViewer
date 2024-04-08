"use client";
import React, { PropsWithChildren } from "react";
import { CookiesProvider as CProvider } from "react-cookie";

const MAX_AGE = 60 * 60 * 1000;

const CookiesProvider = ({ children }: PropsWithChildren) => {
   return (
      <CProvider defaultSetOptions={{ sameSite: `none`, httpOnly: false, maxAge: MAX_AGE }}>
         {children}
      </CProvider>
   );
};

export default CookiesProvider;