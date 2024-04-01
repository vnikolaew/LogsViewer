"use client";
import React from "react";
import { ServiceLogTree } from "@/providers/types";
import { useLogsStore } from "@/stores/logsStore";
import { UilCloudDatabaseTree } from "@iconscout/react-unicons";

export interface NavbarProps {

}

const Navbar = ({}: NavbarProps) => {
   const setTree = useLogsStore(state => state.setTree);

   async function handleViewLogTree() {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/tree`, {
         headers: {
            Accept: `application/json`,
         },
         credentials: `include`,
         mode: `cors`,
      })
         .then(res => (res.json() as Promise<{ tree: ServiceLogTree[] }>))
         .then(root => {
            console.log(`Response: `, root);
            setTree(root.tree);
         });
   }

   return (
      <nav className={``}>
         <div className={`flex px-12 py-4 !pt-6 !pb-2 gap-8 items-center self-center`}>
            <h1 className={`text-center text-2xl`}>
               Logs Viewer UI
            </h1>
            <button
               onClick={handleViewLogTree}
               className={`btn btn-sm btn-link !items-end !pb-1`}>
               <UilCloudDatabaseTree className={`text-primary`} size={18} />
               See log tree
            </button>
         </div>
         <div className={`divider divider-neutral !my-0`}></div>
      </nav>
   );
};

export default Navbar;
