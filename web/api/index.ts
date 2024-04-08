import { LogFileInfo, ServiceLogTree } from "@/providers/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export const api = {
   async getLogsTree() {
      return await fetch(`${API_URL}/logs/tree`, {
         headers: {
            Accept: `application/json`,
         },
         credentials: `include`,
         mode: `cors`,
      }).then(res => (res.json() as Promise<{ tree: ServiceLogTree[] }>));
   },
   async getFileLogInfo(serviceName: string, fileName: string) {
      return await fetch(`${API_URL}/logs/${serviceName}/${fileName}`, {
         headers: {
            Accept: `application/json`,
         },
         credentials: `include`,
         mode: `cors`,
      }).then(res => res.json() as Promise<LogFileInfo>);
   },
   async getLogFiles(serviceName: string, offset: number, limit: number) {
      return await fetch(`${API_URL}/logs/${serviceName}/files?offset=${offset}&limit=${limit}`,
         {
            headers: {
               Accept: `application/json`,
            },
            credentials: `include`,
            mode: `cors`,
         }).then<{ files: LogFileInfo[], hasMore: boolean }>(res => res.json());
   },
   async getServices() {
      return await fetch(`${API_URL}/logs/services`, {
         headers: {
            Accept: `application/json`,
         },
         credentials: `include`,
         mode: `cors`,
      }).then<{ services: string[] }>(res => res.json());
   },
} as const;