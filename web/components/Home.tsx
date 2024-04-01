"use client";
import React, {
   ChangeEvent,
   MouseEventHandler,
   UIEventHandler,
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react";
import { HUB_METHODS, useHubConnection } from "@/providers/LogsHubProvider";
import { LogsUpdate, SubscribeToLogsResponse } from "@/providers/types";
import { useLogsStore } from "@/stores/logsStore";
import Sidebar from "@/components/Sidebar";
import { UilArrowDown } from "@iconscout/react-unicons";

const SERVICE_NAMES = [
   `DataCaptureClient`,
   `ApplicationServer`,
   `AutoClientManager`,
   `EmailInput`,
   `ExportClient`,
   `ImageProcessingClient`,
   `OcrClient`,
   `SdkService`,
   `SdkWrapper`,
];

export interface HomeProps {

}

const Home = ({}: HomeProps) => {
   const hubConnection = useHubConnection();
   const {
      insertLogs,
      entries,
      deleteAllLogs,
      tree: { tree },
      selectedServiceName,
      setSelectedServiceName,
      subscribedServices,
      unsubscribeFromService,
      subscribeToService,
   } = useLogsStore(state => ({
      insertLogs: state.insertLogs,
      entries: state.entries,
      deleteAllLogs: state.deleteAllLogs,
      tree: state.serviceLogsTree,
      selectedServiceName: state.selectedServiceName,
      setSelectedServiceName: state.setSelectedServiceName,
      subscribedServices: state.subscribedServices,
      unsubscribeFromService: state.unsubscribeFromService,
      subscribeToService: state.subscribeToService,
   }));
   console.log({ tree });

   const selectedLogs = useMemo<LogsUpdate>(() => entries[selectedServiceName],
      [entries, selectedServiceName]);

   const logsSectionRef = useRef<HTMLDivElement | null>(null!);
   const [showScrollDownButton, setShowScrollDownButton] = useState(true);

   const getFormattedDate = useCallback((dateString: string) => {
         const date = new Date(dateString);

         const formattedDate = date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
         });
         return formattedDate;
      },
      [],
   );

   console.log({ selectedLogs });

   useEffect(() => {
      hubConnection.on(HUB_METHODS.SendUpdates, (value: LogsUpdate) => {
         insertLogs(value);
      });

   }, []);


   function handleServiceChange({ currentTarget: { value } }: ChangeEvent<HTMLSelectElement>) {
      setSelectedServiceName(value);
   }

   function handleSubscribe() {
      hubConnection
         .invoke<SubscribeToLogsResponse>(HUB_METHODS.Subscribe, selectedServiceName.trim())
         .then(console.log)
         .catch(console.error);
      subscribeToService(selectedServiceName.trim());
   }

   function handleUnsubscribe() {
      hubConnection
         .invoke<SubscribeToLogsResponse>(HUB_METHODS.Unsubscribe, selectedServiceName.trim())
         .then(res => {
            console.log(res);

            unsubscribeFromService(selectedServiceName);
            deleteAllLogs(selectedServiceName);
         })
         .catch(console.error);
   }


   const handleScrollDown: MouseEventHandler = (event) => {
      logsSectionRef.current?.scrollTo({ behavior: `smooth`, top: logsSectionRef.current?.scrollHeight });
      console.log(
         logsSectionRef.current?.scrollHeight,
         Math.ceil(logsSectionRef.current?.scrollTop! + logsSectionRef.current?.clientHeight!));
   };

   const handleSectionScroll: UIEventHandler = (event) => {
      event.preventDefault();

      const { scrollTop, scrollHeight, clientHeight } = logsSectionRef.current!;

      // Adjust the threshold as needed
      const threshold = 10; // You can adjust this value to define how close to the bottom is considered "scroll end"

      const isScrollAtEnd = scrollHeight - scrollTop <= clientHeight + threshold;
      if (isScrollAtEnd) setShowScrollDownButton(false);
      else if (!showScrollDownButton) setShowScrollDownButton(true);
   };

   // @ts-ignore
   return (
      <div className={`grid gap-8 grid-cols-5 w-full`}>
         <div className={`col-span-1`}>
            <Sidebar />
         </div>

         <div className={`flex flex-col gap-4 col-span-4`}>
            <div className={`text-sm flex items-center gap-2 text-gray-300`}>
               <h2 className={`mr-4`}>Subscribed services:</h2>
               {[...subscribedServices].map((service, i) => (
                  <div className={`badge badge-neutral`} key={i}>{service}</div>
               ))}
            </div>
            <div className={`flex gap-3 items-center justify-start mt-8`}>
               <select
                  value={selectedServiceName}
                  onChange={handleServiceChange}
                  className={`rounded-md select select-sm select-bordered select-info text-white px-3 py-1 text-sm w-[200px]`}
                  id={`service-select`} name={`service`}>
                  {SERVICE_NAMES.map((service, i) => (
                     <option key={`${service}_${i}`} value={service}>{service}</option>
                  ))}
               </select>
               <button aria-label={`Subscribe`}
                       disabled={Object.keys(entries).some(s => s === selectedServiceName)}
                       onClick={handleSubscribe}
                       className={`px-3 btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-primary disabled:text-white shadow-md py-0.5 rounded-md text-white`}>
                  Subscribe
               </button>
               <button
                  disabled={!Object.keys(entries).some(s => s === selectedServiceName)}
                  aria-label={`Unsubscribe`}
                  onClick={handleUnsubscribe}
                  className={`px-3 btn btn-sm btn-active btn-error disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-error disabled:text-white shadow-md py-0.5 rounded-md text-white`}>
                  Unsubscribe
               </button>
            </div>
            <div className={`flex flex-col gap-2 mt-4`}>
               <h2 className={`text-xl`}>
                  Logs:
               </h2>
               {selectedLogs?.logFileName?.length && (
                  <div className={`flex items-center justify-between`}>
                     <h2>
                        File Name:
                     </h2>
                     <span
                        className={`border-[1px] rounded-full py-[4px] px-3 badge badge-primary badge-outline badge-lg`}>
                     {selectedLogs.logFileName.trim()}
                     </span>
                  </div>
               )}
               <div className={`flex items-center justify-between`}>
                  <h2>
                     File last write time:
                  </h2>
                  <span
                     className={`border-[1px] rounded-full py-[4px] text-sm px-3 badge badge-neutral badge-lg`}>
                     {getFormattedDate(tree?.find(t => t.serviceName === selectedServiceName)?.logFiles?.[0]?.lastWriteTime!)}
                  </span>
               </div>
               <div onScroll={handleSectionScroll}
                    ref={logsSectionRef}
                    className={`flex p-3 border-b-[1px] border-neutral rounded-md relative flex-col gap-[1px] overflow-y-scroll max-h-[300px] shadow-lg mt-4`}>
                  {selectedLogs?.logs && selectedLogs.logs.map((log, i) => (
                     <span className={`text-sm text-gray-300`} key={i}>{log.rawContent}</span>
                  ))}
                  {showScrollDownButton && (
                     <div className={`sticky text-right text-white bottom-8 right-12 z-10 mr-8`}>
                        <div data-tip={`Scroll to bottom`} className={`tooltip tooltip-top before:!text-xxs before:!py-0`}>
                           <button onClick={handleScrollDown} className={`btn btn-sm btn-circle btn-neutral`}>
                              <UilArrowDown />
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default Home;
