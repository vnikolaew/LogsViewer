"use client";
import React, { Fragment, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useLogsStore } from "@/stores/logsStore";
//@ts-ignore
import {
   UilCloudDatabaseTree,
   UilSearch,
   UilMailbox,
//@ts-ignore
} from "@iconscout/react-unicons";
import { api } from "@/api";
import { cn } from "@/utils/cn";
import { useThrottle } from "@uidotdev/usehooks";
import { LogFileInfo, ServiceLogTree } from "@/providers/types";
import { useFilteredEntries } from "@/hooks/useFilteredEntries";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useOnClickOutside } from "next/dist/client/components/react-dev-overlay/internal/hooks/use-on-click-outside";
import Link from "next/link";
import ThemeSwitch from "@/components/navbar/ThemeSwitch";
import { Auth } from "@/components/common";

export interface NavbarProps {

}

const Navbar = ({}: NavbarProps) => {
   const session = useSession();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

   const dropdownRef = useRef<HTMLUListElement>(null!);
   useOnClickOutside(dropdownRef.current!, _ => setIsDropdownOpen(false));

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


   const handleSignOut = async () => {
      setIsDropdownOpen(false);
      await signOut();
   };

   return (
      <nav className={``}>
         <div className={`navbar bg-base-200 flex px-12 py-4 !pt-6 !pb-3 gap-8 items-center justify-between`}>
            <div className={`flex items-center gap-4`}>
               <h1 className={`text-center text-xl 2xl:text-2xl text-base-content`}>
                  Log Viewer UI
               </h1>
               <Auth>
                  <button
                     onClick={handleToggleLogTree}
                     className={`btn btn-sm btn-link !items-end !pb-1`}>
                     <UilCloudDatabaseTree className={`text-primary`} size={18} />
                     {tree?.tree?.length ? `Hide log tree` : `Show log tree`}
                  </button>
               </Auth>
               <Link href={`/emails`}>
                  <button
                     onClick={handleToggleLogTree}
                     className={`btn btn-sm btn-link !items-end !pb-1`}>
                     <UilMailbox className={`text-primary`} size={18} />
                     E-mails
                  </button>
               </Link>
            </div>
            <div className={`flex-none relative flex items-center`}>
               <Auth>
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
               </Auth>
               <ThemeSwitch />
               {!session?.data && (
                  <Link href={`/signin`}>
                     <button className={`btn btn-sm btn-ghost`}>Sign In</button>
                  </Link>
               )}
               <div className={`dropdown absolute !w-32 -bottom-6 bg-red-500`}>
               </div>
               {session?.data?.user?.image && (
                  <div className={cn(
                     `dropdown relative dropdown-bottom`,
                     isDropdownOpen && `dropdown-open`)}>
                     <div onClick={_ => setIsDropdownOpen(true)} tabIndex={0} role={"button"}
                          className={`avatar !h-fit ml-2 cursor-pointer`}>
                        <div className={`w-8 h-8 rounded-full`}>
                           {session.data.user?.image && (
                              <Image className={`shadow-md`} height={48} width={48}
                                     src={session.data.user?.image!.trim()}
                                     alt={`User profile picture`} />
                           )}
                        </div>
                     </div>
                     <ul
                        ref={dropdownRef}
                        className={`dropdown-content bg-base-200 absolute flex flex-col !border-base-content !border-opacity-20 !border-[.5px] !-translate-x-[calc(100%-40px)] !rounded-lg menu !w-fit py-4 px-6 z-10 text-base-content gap-2`}
                        tabIndex={0}>
                        <li className={`text-nowrap text-center`}>You&apos;re logged in as <br /> <span
                           style={{ all: `unset`, fontWeight: `bold` }}
                           className={``}>{session!.data.user!.name}</span></li>
                        <li className={`text-nowrap mt-2`}>
                           <button
                              onClick={handleSignOut}
                              className={`btn btn-sm btn-error text-white !font-normal !shadow-md`}>
                              Sign out
                           </button>
                        </li>
                     </ul>
                  </div>
               )}
            </div>
         </div>
         <div className={`divider divider-base-100 !my-0 !py-0 !h-fit`}></div>
      </nav>
   );
};

export default Navbar;
