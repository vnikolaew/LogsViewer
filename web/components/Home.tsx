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
import { LogsUpdate, ServiceLogsResponse, SubscribeToLogsResponse } from "@/providers/types.d";
import { useLogsStore } from "@/stores/logsStore";
import type { LogsEntry } from "@/stores/logsStore";
import Sidebar from "@/components/Sidebar";
// @ts-ignore
import { UilArrowDown, UilSearch, UilTimes, UilCopy } from "@iconscout/react-unicons";
import { useMarkContext } from "@/providers/MarksProvider";
import Mark from "mark.js";
import { useThrottle } from "@uidotdev/usehooks";
import { getServices } from "@/api";
import ClickEvent = JQuery.ClickEvent;

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
      services, setServices,
      selectedLogFile,
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
      selectedLogFile: state.selectedLogFile,
   }));

   const selectedLogs = useMemo<LogsEntry>(() => {
         if (selectedLogFile) {
            return {
               logs: selectedLogFile.logs ?? [],
               logFileName: selectedLogFile.fileName,
               serviceName: selectedLogFile.serviceName,
               newFilePosition: 0,
               subscriptionId: ``,
            };

         } else return entries[selectedServiceName];
      },
      [entries, selectedLogFile, selectedServiceName]);

   const [logsSearchValue, setLogsSearchValue] = useState(``);
   const searchThrottledValue = useThrottle(logsSearchValue, 750);
   const [copyToClipboardMessage, setCopyToClipboardMessage] = useState(`Copy to clipboard`);

   const selectedLogLinesCount = useMemo<number>(() => selectedLogs?.logs?.length ?? 0,
      [selectedLogs?.logs?.length]);

   const logsSectionRef = useRef<HTMLDivElement | null>(null!);
   const [showScrollDownButton, setShowScrollDownButton] = useState(true);

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
      logsSectionRef.current?.scrollTo({ behavior: `smooth`, top: logsSectionRef.current?.scrollHeight });
   }, [mark, selectedLogs]);


   useEffect(() => {
      hubConnection.on(HUB_METHODS.SendUpdates, (value: LogsUpdate) => {
         insertLogs(value);
      });

      // Retrieve available services:
      if (!services.length) {
         getServices()
            .then(({ services }) => {
               setServices(services);
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

   const handleScrollDown: MouseEventHandler = (event) => {
      logsSectionRef.current?.scrollTo({ behavior: `smooth`, top: logsSectionRef.current?.scrollHeight });
   };

   const handleSectionScroll: UIEventHandler = (event) => {
      event.preventDefault();

      const { scrollTop, scrollHeight, clientHeight } = logsSectionRef.current!;

      // Adjust the threshold as needed
      const THRESHOLD = 10; // You can adjust this value to define how close to the bottom is considered "scroll end"

      const isScrollAtEnd = scrollHeight - scrollTop <= clientHeight + THRESHOLD;
      if (isScrollAtEnd) setShowScrollDownButton(false);
      else if (!showScrollDownButton) setShowScrollDownButton(true);
   };

   const handleGetAllLogs: MouseEventHandler<HTMLButtonElement> = (event) => {
      event.preventDefault();
      hubConnection.invoke<ServiceLogsResponse>(HUB_METHODS.GetAllLogs, selectedServiceName)
         .then(res => {
            console.log({ res });
         });

   }

   const handleCopyFileNameToClipboard: MouseEventHandler<HTMLDivElement> = (event) => {
      navigator
         .clipboard
         .writeText(selectedLogs.logFileName.trim())
         .then(_ => {
            setCopyToClipboardMessage(`Copied!`);
            setTimeout(() => setCopyToClipboardMessage(`Copy to clipboard`), 1_000);
         })
         .catch(_ => {
            setCopyToClipboardMessage(`Error!`);
         });
   };

   // @ts-ignore
   return (
      <div className={`grid gap-8 grid-cols-6 w-full`}>
         <div className={`col-span-1`}>
            <Sidebar />
         </div>

         <div className={`flex flex-col gap-4 col-span-5`}>
            <div className={`text-sm flex items-center gap-2 text-gray-300`}>
               <h2 className={`mr-4`}>Subscribed services:</h2>
               {[...subscribedServices].map((service, i) => (
                  <div className={`badge badge-neutral`} key={i}>{service}</div>
               ))}
            </div>
            <div className={`flex gap-3 items-center justify-between mt-8`}>
               <div className={`flex gap-3 items-center justify-start`}>
                  <select
                     value={selectedServiceName}
                     onChange={handleServiceChange}
                     className={`rounded-md select select-sm select-bordered select-info text-white px-3 py-1 text-sm w-[200px]`}
                     id={`service-select`} name={`service`}>
                     {services.map((service, i) => (
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
                  <button
                     // disabled={!Object.keys(entries).some(s => s === selectedServiceName)}
                     aria-label={`Get all logs`}
                     onClick={handleGetAllLogs}
                     className={`px-3 btn btn-sm btn-active btn-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-accent disabled:text-white shadow-md py-0.5 rounded-md text-white`}>
                     Get all logs
                  </button>
               </div>
               <div className={`mx-12 self-center flex justify-end flex-1`}>
                  <label className="input w-1/2 input-sm input-bordered flex items-center gap-2">
                     <input
                        onChange={e => setLogsSearchValue(e.target.value)} value={logsSearchValue} type="text"
                        className="grow" placeholder="Search logs ..." />
                     {searchThrottledValue.length ? (
                        <UilTimes
                           onClick={(_: any) => setLogsSearchValue(``)}
                           className={`cursor-pointer text-white`} size={20} />
                     ) : (
                        <UilSearch className={`text-white`} size={16} />
                     )}
                  </label>
               </div>
            </div>
            <div className={`flex flex-col gap-2 mt-4 mr-8`}>
               <h2 className={`text-xl`}>
                  Logs:
               </h2>
               <h2 className={`text-md`}>
                  {showHighlightLoadingSpinner && `Loading ...`}
               </h2>
               {selectedLogs?.logFileName?.length && (
                  <div className={`flex items-center justify-between`}>
                     <h2>
                        File Name:
                     </h2>
                     <div className={`flex items-center gap-2`}>
                        <div
                           className={`border-[1px] flex items-center rounded-lg py-[2px] px-3 badge badge-primary badge-outline badge-md`}>
                        <span>
                           {selectedLogs.logFileName.trim()}
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
                     <h2>
                        File last write time:
                     </h2>
                     <span
                        className={`border-[1px] rounded-full py-[4px] text-sm px-3 badge badge-neutral badge-md`}>
                     {getFormattedDate(tree?.find(t => t.serviceName === selectedServiceName)?.logFiles?.[0]?.lastWriteTime!)}
                  </span>
                  </div>
               )}
               {selectedLogs && (
                  <div className={`flex items-center justify-between`}>
                     <h2>
                        Logs count:
                     </h2>
                     <span
                        className={`border-[1px] rounded-full py-[4px] text-sm px-3 badge badge-secondary badge-outline badge-lg`}>
                     {selectedLogLinesCount}
                  </span>
                  </div>
               )}
               {selectedLogs?.logs && (
                  <div onScroll={handleSectionScroll}
                       ref={logsSectionRef}
                       id={`logs`}
                       className={`flex p-3 border-b-[1px] border-neutral rounded-md relative flex-col gap-[1px] overflow-y-scroll max-h-[300px] shadow-lg mt-4`}>
                     {selectedLogs?.logs && selectedLogs.logs.map((log, i) => (
                        <span className={`text-sm text-gray-300`} key={i}>{log.rawContent}</span>
                     ))}
                     {showScrollDownButton && selectedLogs && (
                        <div className={`sticky text-right text-white bottom-8 right-12 z-10 mr-8`}>
                           <div data-tip={`Scroll to bottom`}
                                className={`tooltip tooltip-top before:!text-xxs before:!py-0`}>
                              <button onClick={handleScrollDown} className={`btn btn-sm btn-circle btn-neutral`}>
                                 <UilArrowDown />
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default Home;
