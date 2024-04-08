import React, { PropsWithChildren } from "react";
import Sidebar from "@/components/sidebar";

export interface LayoutProps extends PropsWithChildren {
   params: { service: string };
}

const Layout = ({ children,  }: LayoutProps) => {
   return (
      <div className={`grid gap-8 md:grid-cols-9 2xl:grid-cols-12 w-full`}>
         <div className={`md:col-span-2 2xl:col-span-2`}>
            <Sidebar />
         </div>
         {children}
      </div>
   );
};

export default Layout;
