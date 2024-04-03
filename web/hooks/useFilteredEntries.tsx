import { useMemo } from "react";
import { useLogsStore } from "@/stores/logsStore";

export function useFilteredEntries(searchValue: string) {
   const tree = useLogsStore(state => state.serviceLogsTree);

   const filteredEntries = useMemo(() => {
      if (!searchValue.length) return [];
      const parts = searchValue.split("/");
      if (parts.length === 2) {
         return tree?.tree?.filter(t =>
            t.serviceName.toLowerCase().includes(parts[0].toLowerCase().trim())
            && t.logFiles.some(f => f.fileName.toLowerCase().includes(parts[1].toLowerCase().trim()))) ?? [];
      }

      return tree?.tree?.filter(t =>
         t.serviceName.toLowerCase().includes(searchValue.toLowerCase().trim())) ?? [];
   }, [searchValue, tree?.tree]);

   return filteredEntries;
}