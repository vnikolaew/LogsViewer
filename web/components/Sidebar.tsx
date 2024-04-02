"use client";
import React, { Fragment } from "react";
import { useLogsStore } from "@/stores/logsStore";
import { LogFileInfo, ServiceLogTree, SubscribeToLogsResponse } from "@/providers/types";
import { UilListUl, UilPlus } from "@iconscout/react-unicons";
import { HUB_METHODS, useHubConnection } from "@/providers/LogsHubProvider";
import { cn } from "@/utils/cn";
import { getFileLogInfo, getLogFiles } from "@/api";

export interface SidebarProps {

}

const Sidebar = ({}: SidebarProps) => {
   const serviceLogsTree = useLogsStore(
      state => state.serviceLogsTree);

   return (
      <div className={` border-r-[1px] border-neutral-500 shadow-md rounded-md`}>
         {serviceLogsTree?.tree && serviceLogsTree.tree.map((tree, i) => (
            <Fragment key={i}>
               <LogsTreeEntry key={i} tree={tree} />
               {i !== serviceLogsTree.tree.length - 1 && (
                  <div className={`divider mx-auto w-3/4 before:!h-[1px] after:!h-[1px] !text-gray-100 !my-0`}></div>
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
   const {
      setSelectedServiceName,
      selectedLogFile,
      subscribeToService,
      subscribedServices,
      addServiceLogFiles,
      setSelectedLogFile,
   } = useLogsStore(state => ({
      setSelectedServiceName: state.setSelectedServiceName,
      subscribedServices: state.subscribedServices,
      subscribeToService: state.subscribeToService,
      addServiceLogFiles: state.addServiceLogFiles,
      setSelectedLogFile: state.setSelectedLogFile,
      selectedLogFile: state.selectedLogFile,
   }));
   const hubConnection = useHubConnection();

   function handleClickLogFile(file: LogFileInfo) {
      const { serviceName } = tree;
      setSelectedServiceName(serviceName);

      getFileLogInfo(serviceName, file.fileName)
         .then(res => {
            console.log(res);
            setSelectedLogFile({ ...res.fileInfo, serviceName, logs: res.logs });
         })
         .catch(console.error);

      if (!subscribedServices.has(serviceName)) {
         hubConnection
            .invoke<SubscribeToLogsResponse>(HUB_METHODS.Subscribe, serviceName.trim())
            .then(console.log)
            .catch(console.error);

         subscribeToService(serviceName);
      }

   }

   async function handleGetMoreFiles() {
      getLogFiles(tree.serviceName, tree.logFiles.length, 10)
         .then(res => {
            console.log(res);
            addServiceLogFiles(tree.serviceName, res.files);
         })
         .catch(console.error);
   }

   return (
      <div className="collapse !outline-none collapse-arrow bg-primary-content/0  !max-h-fit !min-h-fit !h-fit">
         <input name={`item-accordion`} className={`!h-[2rem] !min-h-[2rem]`} type="radio" />
         <div
            className="collapse-title after:!top-[1rem] !h-[2rem] !min-h-[2rem] flex items-center justify-start text-md text-left py-2 px-2 font-medium ">
            {tree.serviceName}
         </div>
         <div className="collapse-content flex flex-col items-start !text-sm !text-gray-300 !pb-2 !pt-2">
            {tree?.logFiles?.map((file, i) => (
               <div data-tip={`Inspect`}
                    className={`tooltip tooltip-right before:!text-xxs before:!py-[.15rem] before:!bg-gray-900 before:!z-10`}
                    key={`${file.fileName}-${i}`}>
                  <div
                     onClick={_ => handleClickLogFile(file)}
                     className={cn(
                        `rounded-md cursor-pointer text-xs py-1 px-2 flex items-center justify-start gap-2 transition-colors duration-200 hover:bg-gray-900`,
                        selectedLogFile?.fileName?.endsWith(file.fileName) && `bg-neutral-800 hover:bg-neutral-700`,
                     )}
                     key={`${file.fileName}-${i}`}>
                     <UilListUl color={`#ffffff`} size={12} />
                     {file.fileName}
                  </div>
               </div>
            ))}
            {tree?.totalLogFilesCount > tree?.logFiles?.length && (
               <div data-tip={``}
                    className={`tooltip tooltip-right before:!text-xxs before:!py-[.15rem] before:!bg-gray-900 before:!z-10 mt-2`}
                    key={`see-more`}>
                  <div
                     onClick={_ => handleGetMoreFiles()}
                     className={`rounded-md cursor-pointer text-xs py-1 px-2 flex items-center justify-start gap-2 transition-colors duration-200 hover:bg-gray-900 `}>
                     <UilPlus color={`#ffffff`} size={12} />
                     Load more
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};
export default Sidebar;
