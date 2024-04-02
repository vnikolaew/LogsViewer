"use client";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useLogsStore } from "@/stores/logsStore";
//@ts-ignore
import { UilCloudDatabaseTree, UilSearch } from "@iconscout/react-unicons";
import { getFileLogInfo, getLogsTree } from "@/api";
import { cn } from "@/utils/cn";
import { useThrottle } from "@uidotdev/usehooks";
import { LogFileInfo, ServiceLogTree } from "@/providers/types";
import { useHubConnection } from "@/providers/LogsHubProvider";

export interface NavbarProps {

}

const Navbar = ({}: NavbarProps) => {
   const hubConnection = useHubConnection();
   const {
      setTree, tree,
      subscribeToService,
      setSelectedServiceName,
      setSelectedLogFile,
      entries,
   } = useLogsStore(state => ({
      setTree: state.setTree,
      tree: state.serviceLogsTree,
      subscribeToService: state.subscribeToService,
      setSelectedLogFile: state.setSelectedLogFile,
      setSelectedServiceName: state.setSelectedServiceName,
      entries: state.entries,
   }));

   const [globalSearch, setGlobalSearch] = useState(`auto`);
   const throttledSearchValue = useThrottle(globalSearch, 500);

   const filteredEntries = useMemo(() => {
      if (!throttledSearchValue.length) return [];
      const parts = throttledSearchValue.split("/");
      if (parts.length === 2) {
         return tree?.tree?.filter(t =>
            t.serviceName.toLowerCase().includes(parts[0].toLowerCase().trim())
            && t.logFiles.some(f => f.fileName.toLowerCase().includes(parts[1].toLowerCase().trim()))) ?? [];
      }

      return tree?.tree?.filter(t =>
         t.serviceName.toLowerCase().includes(throttledSearchValue.toLowerCase().trim())) ?? [];
   }, [throttledSearchValue, tree?.tree]);

   const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);
   const searchResultsDropdownOpen = useMemo(() => {
      return isSearchInputFocused && throttledSearchValue?.length && filteredEntries?.length;
   }, [filteredEntries?.length, isSearchInputFocused, throttledSearchValue?.length]);

   useEffect(() => {
      console.log(tree?.tree?.length);
      if (tree?.tree?.length) return;

      getLogsTree()
         .then(root => {
            setTree(root.tree);
         }).catch(console.error);
   }, [setTree]);

   async function handleToggleLogTree() {
      if (tree?.tree?.length) setTree([]);
      else {
         await getLogsTree()
            .then(root => {
               console.log(`Response: `, root);
               setTree(root.tree);
            });
      }
   }

   const handleSelectLogFile = ({ serviceName }: ServiceLogTree, file: LogFileInfo) => {
      setSelectedLogFile({ ...file, serviceName });
      subscribeToService(serviceName);
      setSelectedServiceName(serviceName);

      getFileLogInfo(serviceName, file.fileName)
         .then(res => {
            console.log(res);
            setSelectedLogFile({ ...res.fileInfo, serviceName, logs: res.logs });
         })
         .catch(console.error)
         .finally(() => {
            setGlobalSearch(``);
         });
   };

   return (
      <nav className={``}>
         <div className={`navbar flex px-12 py-4 !pt-6 !pb-3 gap-8 items-center justify-between`}>
            <div className={`flex items-center gap-4`}>
               <h1 className={`text-center text-2xl`}>
                  Log Viewer UI
               </h1>
               <button
                  onClick={handleToggleLogTree}
                  className={`btn btn-sm btn-link !items-end !pb-1`}>
                  <UilCloudDatabaseTree className={`text-primary`} size={18} />
                  {tree?.tree?.length ? `Hide log tree` : `Show log tree`}
               </button>
            </div>
            <div className={`flex-none relative`}>
               <div className={cn(`dropdown`, searchResultsDropdownOpen && `dropdown-open`)}>
                  <div role={"button"} tabIndex={0} className="form-control ">
                     <label
                        onBlur={(e) => {
                           e.persist();
                           setTimeout(() => {
                              setIsSearchInputFocused(false);
                           }, 100);
                        }}
                        onFocus={_ => setIsSearchInputFocused(true)}
                        className="input input-md input-bordered flex items-center gap-2 w-36 md:w-80">
                        <input
                           value={globalSearch}
                           type="text" placeholder="Search anything ..."
                           onChange={e => setGlobalSearch(e.target.value)}
                           className="grow" />
                        <UilSearch className={`text-white`} size={18} />
                     </label>
                  </div>
                  {!!filteredEntries?.length && (
                     <ul
                        onClick={console.log}
                        className={`dropdown-content p-4 max-h-[300px] overflow-y-scroll !rounded-md  bg-base-100 text-white z-[100] `}>
                        {filteredEntries.map((tree, i) => (
                           <Fragment key={i}>
                              {tree.logFiles.map((file, i) => (
                                 <li onClick={e => {
                                    e.persist();
                                    console.log({ e });
                                    handleSelectLogFile(tree, file);
                                 }} key={i}
                                     className={`text-white rounded-sm w-fit px-2 py-1 flex flex-col items-center hover:bg-base-300 cursor-pointer duration-100 transition-colors`}>
                                    <a className={``}>
                                       {`${tree.serviceName} / ${file.fileName}`}
                                    </a>
                                    <div className={`divider divider-neutral !my-0`}></div>
                                 </li>
                              ))}
                           </Fragment>
                        ))}
                     </ul>
                  )}
               </div>
               <div className={`dropdown absolute !w-32 -bottom-6 bg-red-500`}>
                  {/*<summary className={`display-none bg-transparent text-transparent`}></summary>*/}
               </div>
            </div>
         </div>
         <div className={`divider divider-base-100 !my-0 !py-0 !h-fit`}></div>
      </nav>
   );
};

export default Navbar;
