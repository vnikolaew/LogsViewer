"use client";
import React, { useMemo, useState } from "react";
import { useLogsStore } from "@/stores/logsStore";
//@ts-ignore
import { UilCloudDatabaseTree, UilSearch } from "@iconscout/react-unicons";
import { getLogsTree } from "@/api";

export interface NavbarProps {

}

const Navbar = ({}: NavbarProps) => {
   const { setTree, tree } = useLogsStore(state => ({
      setTree: state.setTree,
      tree: state.serviceLogsTree,
   }));

   const [globalSearch, setGlobalSearch] = useState(``);
   const filteredEntries = useMemo(() => {
      if (!globalSearch.length) return [];
      const parts = globalSearch.split("/");
      if (parts.length === 2) {
         return tree?.tree?.filter(t =>
            t.serviceName.toLowerCase().includes(parts[0].toLowerCase().trim())
            && t.logFiles.some(f => f.fileName.toLowerCase().includes(parts[1].toLowerCase().trim()))) ?? [];
      }

      return tree?.tree?.filter(t =>
         t.serviceName.toLowerCase().includes(globalSearch.toLowerCase().trim())) ?? [];
   }, [tree, globalSearch]);

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
               <div className="form-control">
                  <label className="input input-md input-bordered flex items-center gap-2 w-36 md:w-80">
                     <input
                        value={globalSearch}
                        type="text" placeholder="Search anything ..."
                        onChange={e => setGlobalSearch(e.target.value)}
                        className="grow" />
                     <UilSearch className={`text-white`} size={18} />
                  </label>
               </div>
               <div className={`dropdown absolute !w-32 -bottom-6 bg-red-500`}>
                  {/*<summary className={`display-none bg-transparent text-transparent`}></summary>*/}
                  {!filteredEntries?.length && (
                     <ul className={`dropdown-content bg-base-100 text-white menu z-[100] !w-32`}>
                        <li className={`text-white`}>Entry</li>
                     </ul>
                  )}
               </div>
            </div>
         </div>
         <div className={`divider divider-base-100 !my-0 !py-0 !h-fit`}></div>
      </nav>
   );
};

export default Navbar;
