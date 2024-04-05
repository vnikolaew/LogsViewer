"use client";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useLogsStore } from "@/stores/logsStore";
//@ts-ignore
import { UilCloudDatabaseTree, UilSearch, UilBrightness, UilMoon } from "@iconscout/react-unicons";
import { api } from "@/api";
import { cn } from "@/utils/cn";
import { useThrottle } from "@uidotdev/usehooks";
import { LogFileInfo, ServiceLogTree } from "@/providers/types";
import { useFilteredEntries } from "@/hooks/useFilteredEntries";
import { Themes, useThemeContext } from "@/providers/ThemeProvider";
import { useCookies } from "react-cookie";

export interface NavbarProps {

}

const Navbar = ({}: NavbarProps) => {
   const [_, setCookie] = useCookies([`theme`]);
   const [theme, setTheme] = useThemeContext();

   const {
      setTree, tree,
      subscribeToService,
      setSelectedServiceName,
      setSelectedLogFile,
   } = useLogsStore(state => ({
      setTree: state.setTree,
      tree: state.serviceLogsTree,
      subscribeToService: state.subscribeToService,
      setSelectedLogFile: state.setSelectedLogFile,
      setSelectedServiceName: state.setSelectedServiceName,
      entries: state.entries,
   }));

   const [globalSearch, setGlobalSearch] = useState(``);
   const throttledSearchValue = useThrottle(globalSearch, 500);

   const filteredEntries = useFilteredEntries(throttledSearchValue);

   const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);
   const searchResultsDropdownOpen = useMemo(() => {
      return isSearchInputFocused && throttledSearchValue?.length && filteredEntries?.length;
   }, [filteredEntries?.length, isSearchInputFocused, throttledSearchValue?.length]);

   useEffect(() => {
      if (tree?.tree?.length) return;

      api.getLogsTree()
         .then(root => setTree(root.tree))
         .catch(console.error);
   }, [setTree]);

   async function handleToggleLogTree() {
      if (tree?.tree?.length) setTree([]);
      else {
         await api.getLogsTree()
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

      api.getFileLogInfo(serviceName, file.fileName)
         .then(res => {
            console.log(res);
            setSelectedLogFile({ ...res.fileInfo, serviceName, logs: res.logs });
         })
         .catch(console.error)
         .finally(() => {
            setGlobalSearch(``);
         });
   };

   const handleChangeTheme = () => {
      const newTheme = theme === Themes.DARK ? Themes.LIGHT : Themes.DARK;
      setTheme(newTheme);
      setCookie(`theme`, newTheme, { httpOnly: false, sameSite: `strict`, secure: false });
   };

   return (
      <nav className={``}>
         <div className={`navbar bg-base-200 flex px-12 py-4 !pt-6 !pb-3 gap-8 items-center justify-between`}>
            <div className={`flex items-center gap-4`}>
               <h1 className={`text-center text-xl 2xl:text-2xl text-base-content`}>
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
                        className="input input-sm 2xl:input-md input-bordered flex items-center gap-2 w-36 md:w-80">
                        <input
                           value={globalSearch}
                           type="text" placeholder="Search anything ..."
                           onChange={e => setGlobalSearch(e.target.value)}
                           className="grow text-base-content" />
                        <UilSearch className={`text-base-content w-3 h-3 2xl:w-4 2xl:h-4`} />
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
                                    handleSelectLogFile(tree, file);
                                 }} key={i}
                                     className={`text-white text-xs 2xl:text-sm  rounded-sm w-fit px-2 py-1 flex flex-col items-center hover:bg-base-300 cursor-pointer duration-100 transition-colors`}>
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
                  {(!filteredEntries.length && globalSearch?.length) ? (
                     <ul
                        className={`dropdown-content w-full p-4 max-h-[300px] !rounded-md  bg-base-100 text-white z-[100] `}>
                        <li className={`text-gray-300 w-full rounded-sm px-2 py-1 flex items-center `}>
                           <a className={`text-left text-sm`}>
                              No results found
                           </a>
                        </li>
                     </ul>
                  ) : null}
               </div>
               <div
                  data-tip={`Change theme`}
                  onClick={handleChangeTheme} className={`ml-4 cursor-pointer tooltip tooltip-bottom before:!text-xxs before:!py-0`}>
                  <button className={`btn btn-circle btn-sm`}>
                     {theme === Themes.DARK ? <UilBrightness size={18} /> : <UilMoon size={18} />}
                  </button>
               </div>
               <div className={`dropdown absolute !w-32 -bottom-6 bg-red-500`}>
               </div>
            </div>
         </div>
         <div className={`divider divider-base-100 !my-0 !py-0 !h-fit`}></div>
      </nav>
   );
};

export default Navbar;
