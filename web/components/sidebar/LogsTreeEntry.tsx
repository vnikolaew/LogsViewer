import { LogFileInfo, LogsUpdate, ServiceLogTree, SubscribeToLogsResponse } from "@/providers/types";
import { useLogsStore } from "@/stores/logsStore";
import { HUB_METHODS, useHubConnection } from "@/providers/LogsHubProvider";
import { getFileLogInfo, getLogFiles } from "@/api";
// @ts-ignore
import { UilListUl, UilPlus } from "@iconscout/react-unicons";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { sleep } from "@/utils/sleep";
import { cn } from "@/utils/cn";

export interface LogsTreeEntryProps {
   tree: ServiceLogTree;
   index: number;
}

export const LogsTreeEntry = ({ tree, index }: LogsTreeEntryProps) => {
   const {
      setSelectedServiceName,
      selectedLogFile,
      subscribeToService,
      subscribedServices,
      addServiceLogFiles,
      setSelectedLogFile,
      serviceLogsTree,
      unreadLogs
   } = useLogsStore(state => ({
      setSelectedServiceName: state.setSelectedServiceName,
      subscribedServices: state.subscribedServices,
      subscribeToService: state.subscribeToService,
      addServiceLogFiles: state.addServiceLogFiles,
      setSelectedLogFile: state.setSelectedLogFile,
      selectedLogFile: state.selectedLogFile,
      serviceLogsTree: state.serviceLogsTree,
      unreadLogs: state.unreadLogs,
   }));
   const hasUnreadLogs = useMemo(() => unreadLogs[tree.serviceName] === true, [tree.serviceName, unreadLogs]);
   
   const hubConnection = useHubConnection();
   const [loadMoreLoading, setLoadMoreLoading] = useState(false);
   const isFileSelected = useCallback((file : LogFileInfo) => {
      return selectedLogFile?.fileName?.endsWith(file.fileName);
   }, [selectedLogFile?.fileName]);


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
      setLoadMoreLoading(true);
      getLogFiles(tree.serviceName, tree.logFiles.length, 10)
         .then(async res => {
            await sleep(500);
            console.log(res);
            addServiceLogFiles(tree.serviceName, res.files);
         })
         .catch(console.error)
         .finally(() => setLoadMoreLoading(false));
   }

   return (
      <Fragment>
         <li>
            <details>
               <summary className={`flex items-center !justify-between`}>
                  <div className={`flex items-center gap-4`}>
                     {tree.serviceName}
                     {hasUnreadLogs && (
                        <div className={`badge badge-warning md:!px-0 md:!w-2 md:!h-2 2xl:badge-xs`}></div>
                     )}
                  </div>
               </summary>
               <ul className={`flex flex-col`}>
                  {tree.logFiles.map((file, i) => (
                     <div data-tip={isFileSelected(file) ? `Selected` : `Inspect`}
                          className={`tooltip !w-fit tooltip-right before:!text-xxs before:!py-[.15rem] before:!bg-neutral-800 before:!z-10`}
                          key={`${file.fileName}-${i}`}>
                        <li onClick={() => handleClickLogFile(file)}
                            className={cn(`!w-fit`)} key={i}>
                           <a className={cn(`text-xs 2xl:text-sm !py-2 !px-4`,
                              isFileSelected(file) && `bg-neutral-800`,
                           )}>
                              <UilListUl color={`#ffffff`} size={12} />
                              {file.fileName}
                           </a>
                        </li>
                     </div>
                  ))}
                  {tree?.totalLogFilesCount > tree?.logFiles?.length && (
                     <div data-tip={``}
                          className={`tooltip tooltip-right before:!text-xxs before:!py-[.15rem] before:!bg-gray-900 before:!z-10 mt-2`}
                          key={`see-more`}>
                        <li
                           onClick={_ => handleGetMoreFiles()}
                           className={`rounded-md !w-fit cursor-pointer text-xs py-1 px-2 flex items-center justify-start gap-2 transition-colors duration-200 `}>
                           {loadMoreLoading ? (
                              <a className={`text-xs !py-2 !px-4`}>
                                 <div className={`loading loading-xs loading-spinner`}></div>
                                 <span className={``}>Loading ...</span>
                              </a>
                           ) : (
                              <a className={`text-xs !py-2 !px-4`}>
                                 <UilPlus color={`#ffffff`} size={10} />
                                 <span className={` `}>
                                    Load more
                                 </span>
                              </a>)}
                        </li>
                     </div>
                  )}
               </ul>
            </details>
         </li>
         {index !== serviceLogsTree.tree.length - 1 && (
            <div className={`divider mx-auto w-3/4 before:!h-[1px] after:!h-[1px] !text-gray-100 !my-0`}></div>
         )}
      </Fragment>
   );
};
