"use client";
import React, { Fragment } from "react";
import { useLogsStore } from "@/stores/logsStore";
import { LogFileInfo, ServiceLogTree, SubscribeToLogsResponse } from "@/providers/types";
import { UilListUl } from "@iconscout/react-unicons";
import { HUB_METHODS, useHubConnection } from "@/providers/LogsHubProvider";

export interface SidebarProps {

}

const Sidebar = ({}: SidebarProps) => {
   const serviceLogsTree = useLogsStore(
      state => state.serviceLogsTree);

   return (
      <div className={` border-r-[1px] border-primary shadow-md rounded-md`}>
         {serviceLogsTree?.tree && serviceLogsTree.tree.map((tree, i) => (
            <Fragment key={i}>
               <LogsTreeEntry key={i} tree={tree} />
               {i !== serviceLogsTree.tree.length - 1 && (
                  <div className={`divider before:!h-[1px] after:!h-[1px] !text-gray-100 !my-0`}></div>
               )}
            </Fragment>
         ))}
      </div>
   );
};


export interface LogsTreeEntryProps {
   tree: ServiceLogTree;
}

const LogsTreeEntry = ({ tree }: LogsTreeEntryProps) => {
   const { setSelectedServiceName, subscribeToService, subscribedServices } = useLogsStore(state => ({
      setSelectedServiceName: state.setSelectedServiceName,
      subscribedServices: state.subscribedServices,
      subscribeToService: state.subscribeToService,
   }));
   const hubConnection = useHubConnection();

   function handleClickLogFile(file: LogFileInfo) {
      const {serviceName} = tree;
      console.log({ file, serviceName });
      setSelectedServiceName(serviceName);

      if (!subscribedServices.has(serviceName)) {
         hubConnection
            .invoke<SubscribeToLogsResponse>(HUB_METHODS.Subscribe, serviceName.trim())
            .then(console.log)
            .catch(console.error);

         subscribeToService(serviceName)
      }

   }

   return (
      <div className="collapse !outline-none collapse-arrow bg-primary-content/90  !max-h-fit !min-h-fit !h-fit">
         <input className={`!h-[2rem] !min-h-[2rem]`} type="checkbox" />
         <div
            className="collapse-title after:!top-[1rem] !h-[2rem] !min-h-[2rem] flex items-center justify-start text-md text-left py-2 px-2 font-medium ">
            {tree.serviceName}
         </div>
         <div className="collapse-content flex flex-col items-start !text-sm !text-gray-300 !pb-2 !pt-2">
            {tree?.logFiles?.map((file, i) => (
               <div data-tip={`Inspect`}
                    className={`tooltip tooltip-right before:!text-xxs before:!py-[.15rem] !before:!z-10`}
                    key={`${file.fileName}-${i}`}>
                  <div
                     onClick={_ => handleClickLogFile(file)}
                     className={`rounded-md cursor-pointer text-xs py-1 px-2 flex items-center justify-start gap-2 transition-colors duration-200 hover:bg-gray-800`}
                     key={`${file.fileName}-${i}`}>
                     <UilListUl color={`#ffffff`} size={12} />
                     {file.fileName}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};
export default Sidebar;
