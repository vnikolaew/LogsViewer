"use client";
import React, {
   createContext,
   Dispatch,
   PropsWithChildren,
   SetStateAction,
   useContext,
   useState,
} from "react";

export interface ThemeProviderProps extends PropsWithChildren {
   theme?: string
}

const ThemeContext = createContext<[string, Dispatch<SetStateAction<string>>]>(null!);

export const useThemeContext = () => useContext(ThemeContext);

export const Themes = {
   DARK: `dark`,
   LIGHT: `light`,
} as const;

const ThemeProvider = ({ children, theme }: ThemeProviderProps) => {
   const [appTheme, setTheme] = useState(() => theme ?? Themes.LIGHT);

   return (
      <ThemeContext.Provider value={[appTheme, setTheme]}>
         <div data-theme={appTheme}>
            {children}
         </div>
      </ThemeContext.Provider>
   );
};

export default ThemeProvider;
