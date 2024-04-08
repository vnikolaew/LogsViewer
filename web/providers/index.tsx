import React, { PropsWithChildren } from "react";
import { HubConnectionProvider } from "./LogsHubProvider";
import { MarksProvider } from "./MarksProvider";
import ThemeProvider from "./ThemeProvider";
import CookiesProvider from "./CookiesProvider";
import { cookies } from "next/headers";
import { Themes } from "@/utils/constants";
import SessionProvider from "./SessionProvider";

const Providers = async ({ children }: PropsWithChildren) => {
   const theme = cookies().get(`theme`)?.value ?? Themes.DARK;

   return (
      <CookiesProvider>
         <SessionProvider>
            <ThemeProvider theme={theme}>
               <HubConnectionProvider>
                  <MarksProvider>
                     {children}
                  </MarksProvider>
               </HubConnectionProvider>
            </ThemeProvider>
         </SessionProvider>
      </CookiesProvider>
   );
};

export default Providers;