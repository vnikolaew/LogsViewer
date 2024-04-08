"use client";
import React, { useEffect } from "react";
import Home from "@/components/home";
import { api } from "@/api";
import { usePathname } from "next/navigation";
import { useLogsStore } from "@/stores/logsStore";
import { SubscribeToLogsResponse } from "@/providers/types";
import { HUB_METHODS, useHubConnection } from "@/providers/LogsHubProvider";

export interface PageProps {

}

const Page = ({ ...props }: PageProps) => {
   const hubConnection = useHubConnection();
   const [service, log] = usePathname().trim().split("/").map(s => s.trim()).filter(s => !!s.length);
   const { setSelectedLogFile, setSelectedServiceName, subscribedServices, subscribeToService } = useLogsStore(state => ({
      setSelectedLogFile: state.setSelectedLogFile,
      setSelectedServiceName: state.setSelectedServiceName,
      subscribedServices: state.subscribedServices,
      subscribeToService: state.subscribeToService,
   }));

   useEffect(() => {
      const res = api.getFileLogInfo(service as string, log as string)
         .then(res => {
            console.log(res);
            setSelectedLogFile({ ...res.fileInfo, serviceName: service, logs: res.logs });
         })
         .catch(console.error);

      setSelectedServiceName(service);

      if (!subscribedServices.has(service)) {
         hubConnection
            .invoke<SubscribeToLogsResponse>(HUB_METHODS.Subscribe, service.trim())
            .then(console.log)
            .catch(console.error);

         subscribeToService(service);
      }
   }, []);


   return (
      <main className="flex min-h-[80vh] flex-col items-start justify-start p-4 mt-4 col-span-7">
         <Home />
      </main>
   );
};

export default Page;
