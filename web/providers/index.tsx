import React, { PropsWithChildren } from "react";
import { HubConnectionProvider } from "./LogsHubProvider";
import { MarksProvider } from "./MarksProvider";
import ThemeProvider, { Themes } from "./ThemeProvider";
import CookiesProvider from "./CookiesProvider";
import { cookies } from "next/headers";

const Providers = async ({ children }: PropsWithChildren) => {
   const theme = cookies().get(`theme`)?.value ?? Themes.DARK;

   return (
      <CookiesProvider>
         <ThemeProvider theme={theme}>
            <HubConnectionProvider>
               <MarksProvider>
                  {children}
               </MarksProvider>
            </HubConnectionProvider>
         </ThemeProvider>
      </CookiesProvider>
   );
};

export default Providers;