export interface SubscribeToLogsResponse {
   success: boolean,
   message: string,
   serviceName: string,
   connectionId: string
}

export interface LogLine {
   fileIndex: number;
   timestamp: string,
   processId: number,
   threadId: number,
   logLevel: number,
   message: string;
   rawContent: string;
}


export interface LogsUpdate {
   serviceName: string,
   logFileName: string,
   logs: LogLine[],
   newFilePosition: number
}

export interface ServiceLogTree {
   serviceName: string;
   folderRelativePath: string;
   logFiles: LogFileInfo[];
}

export interface LogFileInfo {
   fileName: string;
   fileRelativePath: string;
   fileSize: number;
   lastWriteTime: string;
}