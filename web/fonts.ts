import { Inter, Noto_Sans } from "next/font/google";

const font = process.env.NEXT_PUBLIC_FONT as string;

const notoSans = Noto_Sans({
   subsets: ["latin"],
   weight: ["300", "400"],
});
const inter = Inter({ subsets: ["latin"] });
const fonts = {
   "Noto_Sans": notoSans,
   "Inter": inter,
} as const;

export const nextFont = fonts[font as keyof typeof fonts] ?? fonts["Noto_Sans"];
