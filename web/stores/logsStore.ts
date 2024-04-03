import { create } from "zustand";
import { LogFileInfo, LogsUpdate, LogUpdateType, ServiceLogTree } from "@/providers/types.d";
import { enableMapSet, produce } from "immer";
import { devtools } from "zustand/middleware";

enableMapSet();

export interface LogsEntry extends Omit<LogsUpdate, "updateType" | "oldFilePosition"> {
}

export interface SelectedLogFileInfo extends LogFileInfo {
   serviceName: string;
}

export interface UnreadLogs extends Record<string, boolean> {
}

export interface ServiceLogEntries {

   serviceLogsTree: { tree: ServiceLogTree[] };
   setTree: (tree: ServiceLogTree[]) => void;
   addServiceLogFiles: (serviceName: string, files: LogFileInfo[]) => void;

   selectedServiceName: string;
   setSelectedServiceName: (service: string) => void;

   selectedLogFile: SelectedLogFileInfo;
   setSelectedLogFile: (logFile: SelectedLogFileInfo) => void;

   subscribedServices: Set<string>,
   subscribeToService: (service: string) => void;
   unsubscribeFromService: (service: string) => void;

   entries: Record<string, LogsEntry>;
   services: string[],
   setServices: (services: string[]) => void,

   unreadLogs: UnreadLogs;
   setUnreadLogs: (logs: UnreadLogs) => void;
   markLogAsRead: (serviceName: string) => void;
   markLogAsUnread: (serviceName: string) => void;

   insertLogs: (newLogs: LogsUpdate) => void;
   deleteAllLogs: (serviceName: string) => void;
   changeLogFilePosition: (serviceName: string, newPosition: number) => void;
   changeLogFileName: (serviceName: string, newFileName: string) => void;
}

export const useLogsStore = create(devtools<ServiceLogEntries>((set) => ({
   entries: {},
   services: [],
   unreadLogs: {},
   markLogAsRead: (serviceName: string) => set((state) =>
      produce(state, draft => {
         if (serviceName in draft.unreadLogs) {
            draft.unreadLogs[serviceName] = false;
         }
         return draft;
      })),
   markLogAsUnread: (serviceName: string) => set((state) =>
      produce(state, draft => {
         if (serviceName in draft.unreadLogs) {
            draft.unreadLogs[serviceName] = true;
         }
         return draft;
      })),
   setUnreadLogs: (logs: UnreadLogs) => set((state) =>
      produce(state, draft => {
         draft.unreadLogs = logs;
         return draft;
      })),
   selectedLogFile: null!,
   setSelectedLogFile: (logFile: SelectedLogFileInfo) => set((state) =>
      produce(state, draft => {
         draft.selectedLogFile = logFile;
         draft.unreadLogs[logFile.serviceName] = false;
         return draft;
      })),
   setServices: services => set((state) =>
      produce(state, draft => {
         draft.services = services;
         return draft;
      })),
   serviceLogsTree: { tree: [] },
   selectedServiceName: ``,
   subscribedServices: new Set<string>(),
   subscribeToService: (service: string) => set((state) =>
      produce(state, draft => {
         draft.subscribedServices.add(service);
         return draft;
      })),
   unsubscribeFromService: (service: string) => set((state) =>
      produce(state, draft => {
         draft.subscribedServices.delete(service);
         return draft;
      })),
   setSelectedServiceName: (service: string) => set((state) =>
      produce(state, draft => {
         draft.selectedServiceName = service;
         draft.unreadLogs[service] = false;
         return draft;
      })),
   setTree: (tree: ServiceLogTree[]) => set((state) => {
      return produce(state, draft => {
         draft.serviceLogsTree = { tree };
         return draft;
      });
   }),
   addServiceLogFiles: (serviceName: string, files: LogFileInfo[]) => set((state) => {
      return produce(state, draft => {
         const tree = draft.serviceLogsTree.tree.find(t => t.serviceName === serviceName);
         if (tree) {
            tree.logFiles ??= [];
            tree.logFiles.push(...files);
         }
         return draft;
      });
   }),
   insertLogs: ({
                   serviceName,
                   logs,
                   logFileName,
                   newFilePosition,
                   oldFilePosition,
                   subscriptionId,
                   updateType,
                }: LogsUpdate) => set((state) =>
      produce(state, (draft) => {
         draft.entries[serviceName] ??= { serviceName, logs: [], logFileName, newFilePosition, subscriptionId };

         draft.entries[serviceName].logs ??= [];
         if (updateType === LogUpdateType.New) {
            draft.entries[serviceName].logs.push(...logs);
         } else if (updateType === LogUpdateType.Truncate) {
            draft.entries[serviceName].logs = logs;
         } else if (updateType === LogUpdateType.NoChange) {
            // Pass (NO-OP)
         }

         draft.entries[serviceName].logFileName = logFileName;
         draft.entries[serviceName].newFilePosition = newFilePosition;

         return draft;
      })),

   deleteAllLogs: (serviceName: string) => set((state) => {
      return produce(state, (draft) => {
         delete draft.entries[serviceName];
         return draft;
      });
   }),

   changeLogFilePosition: (serviceName: string, newPosition: number) => set((state) => {
      return produce(state, (draft) => {
         const logsEntry = draft.entries[serviceName];
         if (logsEntry) {
            logsEntry.newFilePosition = newPosition;
         }
         return draft;
      });
   }),

   changeLogFileName: (serviceName: string, newFileName: string) => set((state) => {
      return produce(state, (draft) => {
         const logsEntry = draft.entries[serviceName];
         if (logsEntry) {
            logsEntry.logFileName = newFileName;
         }
         return draft;
      });
   }),
})));