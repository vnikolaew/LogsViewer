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
   logLevel: LogLevel,
   message: string;
   rawContent: string;
}


export interface LogsUpdate {
   subscriptionId: string;
   serviceName: string,
   logFileName: string,
   logs: LogLine[],
   newFilePosition: number
   oldFilePosition: number
   updateType: LogUpdateType;
}

export interface ServiceLogsResponse {
   logs: LogLine[],
   isSuccess: boolean
   serviceName: string;
   message: string;
}

export enum LogUpdateType {
   New = `New`,
   Truncate = `Truncate`,
   NoChange = `NoChange`,
   NewFile = `NewFile`
}

export enum LogLevel {
   Info = `Info`,
   Debug = `Debug`,
   Error = `Error`,
   Warn = `Warn`
}

export interface ServiceLogTree {
   serviceName: string;
   folderRelativePath: string;
   logFiles: LogFileInfo[];
   totalLogFilesCount: number;
}

export interface LogFileInfo {
   fileName: string;
   fileRelativePath: string;
   fileSize: number;
   lastWriteTime: string;
   logs?: LogLine[];
}