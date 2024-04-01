import { create } from "zustand";
import { LogsUpdate, ServiceLogTree } from "@/providers/types";
import { produce, enableMapSet } from "immer";
import { devtools } from "zustand/middleware";

enableMapSet();

export interface ServiceLogEntries {

   serviceLogsTree: { tree: ServiceLogTree[] };
   setTree: (tree: ServiceLogTree[]) => void;

   selectedServiceName: string;
   setSelectedServiceName: (service: string) => void;

   subscribedServices: Set<string>,
   subscribeToService: (service: string) => void;
   unsubscribeFromService: (service: string) => void;

   entries: Record<string, LogsUpdate>;
   services: string[],
   setServices: (services: string[]) => void,

   insertLogs: (newLogs: LogsUpdate) => void;
   deleteAllLogs: (serviceName: string) => void;
   changeLogFilePosition: (serviceName: string, newPosition: number) => void;
   changeLogFileName: (serviceName: string, newFileName: string) => void;
}

export const useLogsStore = create(devtools<ServiceLogEntries>((set) => ({
   entries: {},
   services: [],
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
         return draft;
      })),
   setTree: (tree: ServiceLogTree[]) => set((state) => {
      return produce(state, draft => {
         draft.serviceLogsTree = { tree };
         return draft;
      });
   }),
   insertLogs: ({ serviceName, logs, logFileName, newFilePosition }: LogsUpdate) => set((state) =>
      produce(state, (draft) => {
         draft.entries[serviceName] ??= { serviceName, logs: [], logFileName, newFilePosition };

         draft.entries[serviceName].logs ??= [];
         draft.entries[serviceName].logs.push(...logs);

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