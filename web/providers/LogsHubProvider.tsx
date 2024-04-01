"use client";
import {
   HttpTransportType,
   HubConnection,
   HubConnectionBuilder,
   LogLevel,
   RetryContext,
} from "@microsoft/signalr";
import { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from "react";
import { LogsUpdate } from "@/providers/types";

const hubConnection = new HubConnectionBuilder()
   .withUrl(`${process.env.NEXT_PUBLIC_BASE_URL!}/logs`!, {
      withCredentials: true,
      transport:
         HttpTransportType.ServerSentEvents |
         HttpTransportType.WebSockets |
         HttpTransportType.LongPolling,
   })
   .configureLogging(LogLevel.Information)
   .withAutomaticReconnect({
      nextRetryDelayInMilliseconds(retryContext: RetryContext): number | null {
         return Math.pow(2, retryContext.previousRetryCount);
      },
   })
   .build();

const HubContext = createContext<HubConnection>(null!);

export const useHubConnection = () => useContext(HubContext);

const initializeHub = () => {
   hubConnection.on(HUB_METHODS.TestMethod, (value) => {
      console.log({ value });
   });

   hubConnection.on(HUB_METHODS.SendUpdates, (value: LogsUpdate) => {
      console.log({ value });
   });
};

export enum HUB_METHODS {
   Subscribe = `Subscribe`,
   Unsubscribe = `Unsubscribe`,
   TestMethod = `TestMethod`,
   UpdateFilePosition = `UpdateFilePosition`,
   SendUpdates = `SendUpdates`,
   GetAllLogs = `GetAllLogs`
}


export const HubConnectionProvider: FC<PropsWithChildren> = ({ children }) => {
   useEffect(() => {
      initializeHub();

      hubConnection.start()
         .then(console.log)
         .catch(console.error);

   }, []);

   return <HubContext.Provider value={hubConnection}>{children}</HubContext.Provider>;
};