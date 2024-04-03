"use client";
import React, { useEffect } from "react";
import { useLogsStore } from "@/stores/logsStore";
import { LogsTreeEntry } from "@/components/sidebar/LogsTreeEntry";
import { HUB_METHODS, useHubConnection } from "@/providers/LogsHubProvider";
import { LogsUpdate, LogUpdateType } from "@/providers/types.d";

export interface SidebarProps {

}

const Sidebar = ({}: SidebarProps) => {
   const serviceLogsTree = useLogsStore(
      state => state.serviceLogsTree);
   const hubConnection = useHubConnection();
   const { entries, markLogAsUnread } = useLogsStore(state => ({
      entries: state.entries,
      setUnreadLogs: state.setUnreadLogs,
      markLogAsUnread: state.markLogAsUnread,
   }));

   useEffect(() => {
      hubConnection.on(HUB_METHODS.SendUpdates, ({oldFilePosition, serviceName, newFilePosition, updateType}: LogsUpdate) => {
         if(updateType === LogUpdateType.NoChange) return
         if(updateType === LogUpdateType.New && oldFilePosition < newFilePosition && oldFilePosition !== 0) {
            console.log(`A new log from ${serviceName}`);
            markLogAsUnread(serviceName)
         }

         console.log({ entries });
      });

   }, []);

   return (
      <div className={`border-r-[1px] border-neutral-500 shadow-md rounded-md`}>
         <div className={`my-4`}>
            <div className={`text-2xl text-white px-8`}>Services</div>
            <div className={`divider !my-0 ml-8 w-3/4`}></div>
         </div>
         <ul className={`menu menu-lg bg-base-300/50 rounded-lg w-full `}>
            {serviceLogsTree?.tree && serviceLogsTree.tree.map((tree, i) => (
               <LogsTreeEntry key={i} tree={tree} index={i} />
            ))}
         </ul>
      </div>
   );
};


export default Sidebar;
