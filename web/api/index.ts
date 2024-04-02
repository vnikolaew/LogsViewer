import { LogFileInfo, ServiceLogTree } from "@/providers/types";

export async function getLogsTree() {
   return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/tree`, {
      headers: {
         Accept: `application/json`,
      },
      credentials: `include`,
      mode: `cors`,
   }).then(res => (res.json() as Promise<{ tree: ServiceLogTree[] }>));
}


export async function getFileLogInfo(serviceName: string, fileName: string) {
   return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/${serviceName}/${fileName}`, {
      headers: {
         Accept: `application/json`,
      },
      credentials: `include`,
      mode: `cors`,
   }).then(res => res.json());
}

export async function getLogFiles(serviceName: string, offset: number, limit: number) {
   return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/${serviceName}/files?offset=${offset}&limit=${limit}`,
      {
         headers: {
            Accept: `application/json`,
         },
         credentials: `include`,
         mode: `cors`,
      }).then<{ files: LogFileInfo[], hasMore: boolean }>(res => res.json());
}

export async function getServices() {
   return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/services`, {
      headers: {
         Accept: `application/json`,
      },
      credentials: `include`,
      mode: `cors`,
   }).then<{ services: string[] }>(res => res.json());
}
