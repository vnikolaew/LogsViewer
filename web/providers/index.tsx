import React, { PropsWithChildren } from "react";
import { HubConnectionProvider } from "./LogsHubProvider";
import { MarksProvider } from "./MarksProvider";

const Providers = ({children}:PropsWithChildren) => {
   return (
      <HubConnectionProvider>
         <MarksProvider>
         {children}
         </MarksProvider>
      </HubConnectionProvider>
   );
};

export default Providers;