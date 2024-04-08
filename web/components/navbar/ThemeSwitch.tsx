'use client'
import React from "react";
import { Themes } from "@/utils/constants";
import { useCookies } from "react-cookie";
import { useThemeContext } from "@/providers/ThemeProvider";
//@ts-ignore
import { UilBrightness, UilMoon } from "@iconscout/react-unicons";

const ThemeSwitch = () => {
   const [_, setCookie] = useCookies([`theme`]);
   const [theme, setTheme] = useThemeContext();

   const handleChangeTheme = () => {
      const newTheme = theme === Themes.DARK ? Themes.LIGHT : Themes.DARK;
      setTheme(newTheme);
      setCookie(`theme`, newTheme, { httpOnly: false, sameSite: `strict`, secure: false });
   };
   return (
      <div
         data-tip={`Change theme`}
         onClick={handleChangeTheme}
         className={`ml-4 cursor-pointer tooltip tooltip-bottom before:!text-xxs before:!py-0`}>
         <button className={`btn btn-circle btn-sm`}>
            {theme === Themes.DARK ? <UilBrightness size={18} /> : <UilMoon size={18} />}
         </button>
      </div>
   );
};

export default ThemeSwitch;