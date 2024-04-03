"use client";
import React, {  } from "react";
import { useLogsStore } from "@/stores/logsStore";
import { LogsTreeEntry } from "@/components/sidebar/LogsTreeEntry";

export interface SidebarProps {

}

const Sidebar = ({}: SidebarProps) => {
   const serviceLogsTree = useLogsStore(
      state => state.serviceLogsTree);

   return (
      <div className={`border-r-[1px] border-neutral-500 shadow-md rounded-md`}>
         <ul className={`menu menu-lg bg-base-300/50 rounded-lg max-w-xs w-full`}>
            {serviceLogsTree?.tree && serviceLogsTree.tree.map((tree, i) => (
               <LogsTreeEntry key={i} tree={tree} index={i} />
            ))}
         </ul>
      </div>
   );
};


export default Sidebar;
