import React, { Fragment, MouseEventHandler, useCallback, useState } from "react";
// @ts-ignore
import { UilCopy } from "@iconscout/react-unicons";
import { useSelectedLogs, useSelectedLogsCount } from "@/hooks/useSelectedLogs";
import { useLogsStore } from "@/stores/logsStore";
import { useCopyToClipboard } from "@uidotdev/usehooks";

const FileLogInfoSection = () => {
   const { tree: { tree }, selectedServiceName } = useLogsStore(state => ({
      tree: state.serviceLogsTree,
      selectedServiceName: state.selectedServiceName,
   }));

   const selectedLogs = useSelectedLogs();
   const selectedLogLinesCount = useSelectedLogsCount();

   const [copyToClipboardMessage, setCopyToClipboardMessage] = useState(`Copy to clipboard`);
   const [_, copy] = useCopyToClipboard();
   const getFormattedDate = useCallback((dateString: string) => {
         const date = new Date(dateString);
         return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
         });
      },
      [],
   );

   const handleCopyFileNameToClipboard: MouseEventHandler<HTMLDivElement> = (event) => {
      copy(selectedLogs.logFileName.trim())
         .then(_ => {
            setCopyToClipboardMessage(`Copied!`);
            setTimeout(() => setCopyToClipboardMessage(`Copy to clipboard`), 1_000);
         })
         .catch(_ => {
            setCopyToClipboardMessage(`Error!`);
         });
   };

   return (
      <Fragment>
         {selectedLogs?.logFileName?.length && (
            <div className={`flex items-center justify-between`}>
               <h2 className={`badge text-gray-100 badge-primary badge-md xl:badge-md 2xl:badge-lg`}>
                  File Name:
               </h2>
               <div className={`flex items-center gap-2`}>
                  <div
                     className={`border-[1px] flex items-center rounded-lg py-[2px] px-3 badge badge-primary badge-outline badge-md xl:badge-md 2xl:badge-lg`}>
                        <span>
                           {tree?.flatMap(_ => _.logFiles ?? [])?.find(f => f.fileName === selectedLogs.logFileName.trim())?.fileName ?? selectedLogs.logFileName.trim()}
                        </span>
                  </div>
                  <div onClick={handleCopyFileNameToClipboard}
                       data-tip={copyToClipboardMessage}
                       className={`tooltip before:!text-xxs before:!py-[1px]`}>
                     <UilCopy className={`text-primary cursor-pointer`} size={20} />
                  </div>
               </div>
            </div>
         )}
         {selectedLogs && (
            <div className={`flex items-center justify-between`}>
               <h2 className={`badge text-gray-100 badge-secondary badge-md xl:badge-md 2xl:badge-lg`}>
                  File last write time:
               </h2>
               <span
                  className={`border-[1px] rounded-full py-[4px] text-sm px-3 badge badge-neutral badge-md xl:badge-md 2xl:badge-lg`}>
                     {getFormattedDate(tree?.find(t => t.serviceName === selectedServiceName)?.logFiles?.[0]?.lastWriteTime!)}
                  </span>
            </div>
         )}
         {selectedLogs && (
            <div className={`flex items-center justify-between`}>
               <h2 className={`badge badge-ghost badge-md xl:badge-md  badge-info text-gray-100 2xl:badge-lg`}>
                  Logs count:
               </h2>
               <span
                  className={`border-[1px] rounded-full py-[4px] text-sm px-3 badge badge-secondary badge-outline badge-lg xl:badge-md 2xl:badge-lg`}>
                     {selectedLogLinesCount} total logs
                  </span>
            </div>
         )}

      </Fragment>
   );
};

export default FileLogInfoSection;