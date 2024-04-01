"use client"
import Mark from "mark.js";
import { createContext, FC, MutableRefObject, PropsWithChildren, useContext, useRef } from "react";

const HubContext = createContext<MutableRefObject<Mark | undefined>>(null!);

export const useMarkContext = () => useContext(HubContext);

export const MarksProvider: FC<PropsWithChildren> = ({ children }) => {
   const marks = useRef<Mark>();
   return <HubContext.Provider value={marks!}>{children}</HubContext.Provider>;
};
