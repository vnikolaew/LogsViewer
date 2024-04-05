import { useMemo } from "react";
import { LogsEntry, useLogsStore } from "@/stores/logsStore";

export const useSelectedLogs = () => {
   const {
      selectedLogFile,
      entries,
      selectedServiceName,
   } = useLogsStore(state => ({
      selectedLogFile: state.selectedLogFile,
      entries: state.entries,
      selectedServiceName: state.selectedServiceName,
   }));

   const selectedLogs = useMemo<LogsEntry>(() => {
         if (selectedLogFile) {
            const logs = {
               logs: selectedLogFile.logs ?? [],
               logFileName: selectedLogFile.fileName,
               serviceName: selectedLogFile.serviceName,
               newFilePosition: 0,
               subscriptionId: ``,
            };
            return logs;

         } else return entries[selectedServiceName];
      },
      [entries, selectedLogFile, selectedServiceName]);

   return selectedLogs;
};

export const useSelectedLogsCount = () => {
   const selectedLogs = useSelectedLogs();
   const selectedLogLinesCount = useMemo<number>(() => selectedLogs?.logs?.length ?? 0,
      [selectedLogs?.logs?.length]);

   return selectedLogLinesCount;
};