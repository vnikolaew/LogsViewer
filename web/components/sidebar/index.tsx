"use client";
import React, { useEffect } from "react";
import { useLogsStore } from "@/stores/logsStore";
import { LogsTreeEntry } from "@/components/sidebar/LogsTreeEntry";
import { HUB_METHODS, useHubConnection } from "@/providers/LogsHubProvider";
import { LogsUpdate, LogUpdateType } from "@/providers/types.d";
// @ts-ignore
import { UilSync } from "@iconscout/react-unicons";
import {api} from "@/api";

export interface SidebarProps {

}

const Sidebar = ({}: SidebarProps) => {
   const serviceLogsTree = useLogsStore(
      state => state.serviceLogsTree);
   const hubConnection = useHubConnection();
   const {
      entries,
      markLogAsUnread,
      markLogWithNewFile,
      setServices,
      setUnreadLogs,
      setTree,
   } = useLogsStore(state => ({
      entries: state.entries,
      setUnreadLogs: state.setUnreadLogs,
      markLogAsUnread: state.markLogAsUnread,
      markLogWithNewFile: state.markLogWithNewFile,
      setServices: state.setServices,
      setTree: state.setTree,
   }));

   useEffect(() => {
      hubConnection.on(HUB_METHODS.SendUpdates, ({
                                                    oldFilePosition,
                                                    serviceName,
                                                    newFilePosition,
                                                    updateType,
                                                 }: LogsUpdate) => {
         if (updateType === LogUpdateType.NoChange) return;
         if (updateType === LogUpdateType.New && oldFilePosition < newFilePosition && oldFilePosition !== 0) {
            markLogAsUnread(serviceName);
         }
         if (updateType === LogUpdateType.NewFile) {
            markLogWithNewFile(serviceName);

         }
      });

   }, []);

   async function handleRefreshServices() {
      await Promise.all([
         api.getServices()
            .then(({ services }) => {
               setServices(services);
               setUnreadLogs(services.reduce((acc, curr) => ({ ...acc, [curr]: false }), {}));
            }),
         api.getLogsTree()
            .then(root => {
               console.log({ root });
               setTree(root.tree);
            })
            .catch(console.error),
      ]);
   }

   return (
      <div className={`border-r-[1px] border-neutral-500 shadow-md rounded-md`}>
         <div className={`my-4`}>
            <div className={`text-white px-8 flex items-center justify-between`}>
               <h2 className={`text-2xl`}>
                  Services
               </h2>
               <div onClick={handleRefreshServices} data-tip={`Refresh log services`}
                    className={`tooltip before:!text-xs`}>
                  <UilSync
                     size={16}
                     className={`text-white cursor-pointer hover:text-gray-300 transition-colors duration-200`} />
               </div>
            </div>
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
