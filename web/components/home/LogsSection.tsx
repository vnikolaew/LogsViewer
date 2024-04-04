import React, { MouseEventHandler, useEffect } from "react";
// @ts-ignore
import { UilArrowDown } from "@iconscout/react-unicons";
import { useSelectedLogs } from "@/hooks/useSelectedLogs";
import { useHandleSectionScroll } from "@/hooks/useHandleSectionScroll";

const LogsSection = () => {
   const selectedLogs = useSelectedLogs();
   const [showScrollDownButton,
      _,
      handleSectionScroll,
      logsSectionRef] = useHandleSectionScroll<HTMLDivElement>();

   const handleScrollDown: MouseEventHandler = (_) => {
      logsSectionRef.current?.scrollTo({ behavior: `smooth`, top: logsSectionRef.current?.scrollHeight });
   };

   useEffect(() => {
      logsSectionRef.current?.scrollTo({ behavior: `smooth`, top: logsSectionRef.current?.scrollHeight });
   }, [logsSectionRef, selectedLogs]);

   return selectedLogs?.logs && (
      <div onScroll={handleSectionScroll}
           ref={logsSectionRef}
           id={`logs`}
           className={`flex p-3 border-b-[1px] border-neutral rounded-md relative flex-col gap-[1px] overflow-y-scroll max-h-[300px] xl:max-h-[500px] shadow-lg mt-4`}>
         {selectedLogs?.logs && selectedLogs.logs.map((log, i) => (
            <span className={`text-xs 2xl:text-base text-gray-300`} key={i}>{log.rawContent}</span>
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
   );
};


LogsSection.Title = () => {
   return (
      <div className={`w-full mt-4`}>
         <h2 className={`text-2xl`}>
            Logs
         </h2>
         <div className={`divider w-5/6 !my-0 text-gray-300`}></div>
      </div>
   );
};

LogsSection.Title.displayName = "LogsSection";

export default LogsSection;