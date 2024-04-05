"use client";
import React, {
   ChangeEvent,
   useEffect,
   useState,
} from "react";
import { HUB_METHODS, useHubConnection } from "@/providers/LogsHubProvider";
import { LogsUpdate, SubscribeToLogsResponse } from "@/providers/types.d";
import { useLogsStore } from "@/stores/logsStore";
// @ts-ignore
import { UilSearch, UilTimes } from "@iconscout/react-unicons";
import { useMarkContext } from "@/providers/MarksProvider";
import Mark from "mark.js";
import { useThrottle, } from "@uidotdev/usehooks";
import { api } from "@/api";
import Sidebar from "@/components/sidebar";
import { useSelectedLogs } from "@/hooks/useSelectedLogs";
import LogsSection from "@/components/home/LogsSection";
import FileLogInfoSection from "@/components/home/FileLogInfoSection";

export interface HomeProps {

}

const Home = ({}: HomeProps) => {
   const hubConnection = useHubConnection();
   const mark = useMarkContext();
   const [showHighlightLoadingSpinner, setShowHighlightLoadingSpinner] = useState(false);

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
      services, setServices, setUnreadLogs,
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
      services: state.services,
      setServices: state.setServices,
      setUnreadLogs: state.setUnreadLogs,
   }));

   const selectedLogs = useSelectedLogs();

   const [logsSearchValue, setLogsSearchValue] = useState(``);
   const searchThrottledValue = useThrottle(logsSearchValue, 750);


   useEffect(() => {
      if (!selectedLogs || searchThrottledValue?.length < 3) {
         if (mark.current) mark.current?.unmark();
         return;
      }

      if (mark.current) mark.current?.unmark();
      mark.current = new Mark(document.getElementById(`logs`)!);

      // Show a loading spinner while marking is in progress:
      new Promise<void>((res) => {
         setShowHighlightLoadingSpinner(true);
         mark.current?.mark(searchThrottledValue.trim(), {
            caseSensitive: false,
            className: `bg-yellow-500 p-[.5px] rounded-sm text-white`,
            done(_: number) {
               res();
            },
         });
      }).finally(() => setShowHighlightLoadingSpinner(false));

   }, [mark, searchThrottledValue, selectedLogs]);

   useEffect(() => {
      hubConnection.on(HUB_METHODS.SendUpdates, (value: LogsUpdate) => {
         insertLogs(value);
      });

      // Retrieve available services:
      if (!services.length) {
         api.getServices()
            .then(({ services }) => {
               setServices(services);
               setUnreadLogs(services.reduce((acc, curr) => ({ ...acc, [curr]: false }), {}));
               setSelectedServiceName(services[0]);
            });
      }
   }, [hubConnection, insertLogs, setSelectedServiceName, setServices]);


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

   // @ts-ignore
   return (
      <div className={`grid gap-8 md:grid-cols-9 2xl:grid-cols-12 w-full`}>
         <div className={`md:col-span-2 2xl:col-span-2`}>
            <Sidebar />
         </div>

         <div className={`flex flex-col gap-4 col-span-7 2xl:col-span-10`}>
            <div className={`text-xs 2xl:text-sm flex items-center gap-2 text-neutral-400`}>
               <h2 className={`mr-4`}>Subscribed services:</h2>
               {[...subscribedServices].map((service, i) => (
                  <div className={`badge-sm 2xl:badge-md badge badge-neutral`} key={i}>{service}</div>
               ))}
            </div>
            <div className={`flex gap-3 items-center justify-between mt-8`}>
               <div className={`flex gap-3 items-center justify-start`}>
                  <select
                     value={selectedServiceName}
                     onChange={handleServiceChange}
                     className={`rounded-md select text-xs md:select-sm 2xl:select-md select-bordered select-info text-base-content px-3 2xl:text-sm w-[200px] 2xl:w-[300px]`}
                     id={`service-select`}
                     name={`service`}>
                     {services.map((service, i) => (
                        <option className={``} key={`${service}_${i}`} value={service}>{service}</option>
                     ))}
                  </select>
                  <button aria-label={`Subscribe`}
                          disabled={Object.keys(entries).some(s => s === selectedServiceName) || subscribedServices.has(selectedServiceName)}
                          onClick={handleSubscribe}
                          className={`px-3 btn btn-primary btn-xs 2xl:btn-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-primary disabled:text-white shadow-md py-0.5 rounded-md text-white`}>
                     Subscribe
                  </button>
                  <button
                     disabled={!Object.keys(entries).some(s => s === selectedServiceName) || !subscribedServices.has(selectedServiceName)}
                     aria-label={`Unsubscribe`}
                     onClick={handleUnsubscribe}
                     className={`px-3 btn btn-xs 2xl:btn-sm btn-active btn-error disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-error disabled:text-white shadow-md py-0.5 rounded-md text-white`}>
                     Unsubscribe
                  </button>
               </div>
               <div className={`mx-12 self-center flex justify-end flex-1`}>
                  <label className="input w-1/2 input-xs 2xl:input-md input-bordered flex items-center gap-2">
                     <input
                        onChange={e => setLogsSearchValue(e.target.value)} value={logsSearchValue} type="text"
                        className="grow" placeholder="Search logs ..." />
                     {searchThrottledValue.length ? (
                        <UilTimes
                           onClick={(_: any) => setLogsSearchValue(``)}
                           className={`cursor-pointer text-base-content w-3 h-3`} size={20} />
                     ) : (
                        <UilSearch className={`text-base-content w-3 h-3 2xl:w-4 2xl:h-4`} />
                     )}
                  </label>
               </div>
            </div>
            <div className={`flex flex-col gap-4 mt-4 mr-8`}>
               <h2 className={`text-md`}>
                  {showHighlightLoadingSpinner && `Loading ...`}
               </h2>
               <FileLogInfoSection />
               <LogsSection.Title />
               <LogsSection />
            </div>
         </div>
      </div>
   );
};

export default Home;
