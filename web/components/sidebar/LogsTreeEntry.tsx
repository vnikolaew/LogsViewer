import { LogFileInfo, ServiceLogTree, SubscribeToLogsResponse } from "@/providers/types";
import { LogServiceState, useLogsStore } from "@/stores/logsStore";
import { HUB_METHODS, useHubConnection } from "@/providers/LogsHubProvider";
import {api} from "@/api";
// @ts-ignore
import { UilListUl, UilPlus } from "@iconscout/react-unicons";
import React, { Fragment, useCallback, useMemo, useState } from "react";
import { sleep } from "@/utils/sleep";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Colors } from "@/utils/constants";

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
      unreadLogs,
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
   const logServiceState = useMemo<LogServiceState>(() => unreadLogs[tree.serviceName], [tree.serviceName, unreadLogs]);
   const [submenuOpen, setSubmenuOpen] = useState(false);

   const hubConnection = useHubConnection();
   const [loadMoreLoading, setLoadMoreLoading] = useState(false);
   const isFileSelected = useCallback((file: LogFileInfo) =>
      selectedLogFile?.fileName?.endsWith(file.fileName),
      [selectedLogFile?.fileName]);


   function handleClickLogFile(file: LogFileInfo) {
      const { serviceName } = tree;
      setSelectedServiceName(serviceName);

      api.getFileLogInfo(serviceName, file.fileName)
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
      api.getLogFiles(tree.serviceName, tree.logFiles.length, 10)
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
               <summary
                  onClick={_ => setSubmenuOpen(!submenuOpen)}
                  className={`flex items-center !justify-between`}>
                  <div className={`flex items-center gap-4`}>
                     {tree.serviceName}
                     {logServiceState === LogServiceState.Unread && (
                        <div className={`badge badge-warning badge-xs`}></div>
                     )}
                     {logServiceState === LogServiceState.NewFileCreated && (
                        <div className={`badge badge-success badge-xs`}></div>
                     )}
                  </div>
               </summary>
               <AnimatePresence>
                  {submenuOpen && (
                     <motion.ul
                        animate={{ height: `auto`, opacity: 1 }}
                        transition={{ ease: "easeInOut", duration: 0.4, type: `tween` }}
                        initial={{ height: 0, opacity: 0 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`flex flex-col`}>
                        {tree.logFiles.map((file, i) => (
                           <div data-tip={isFileSelected(file) ? `Selected` : `Inspect`}
                                className={`tooltip !w-fit tooltip-right before:!text-xxs before:!py-[.15rem] before:!bg-neutral-800 before:!z-10`}
                                key={`${file.fileName}-${i}`}>
                              <li onClick={() => handleClickLogFile(file)}
                                  className={cn(`!w-fit`)} key={i}>
                                 <a className={cn(`text-sm !py-2 !px-4`,
                                    isFileSelected(file) && `bg-neutral-800`,
                                 )}>
                                    <UilListUl color={Colors.WHITE} size={12} />
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
                                       <UilPlus color={Colors.WHITE} size={10} />
                                       <span className={` `}>
                                    Load more
                                 </span>
                                    </a>)}
                              </li>
                           </div>
                        )}
                     </motion.ul>
                  )}
               </AnimatePresence>
            </details>
         </li>
         {
            index !== serviceLogsTree.tree.length - 1 && (
               <div className={`divider mx-auto w-3/4 before:!h-[1px] after:!h-[1px] !text-gray-100 !my-0`}></div>
            )
         }
      </Fragment>
   )
      ;
};
