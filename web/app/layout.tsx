import Footer from "@/components/footer";
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";
import Providers from "@/providers";
import Navbar from "@/components/navbar";

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

const nextFont = fonts[font as keyof typeof fonts] ?? fonts["Noto_Sans"];

export const metadata: Metadata = {
   title: "Logs Viewer UI",
   description: "An intuitive Logs Viewer / Inspector UI",
};

export default function RootLayout({
                                      children,
                                   }: {
   children: React.ReactNode
}) {
   return (
      <html lang="en">
      <body className={nextFont.className}>
      <Providers>
         <Navbar />
         {children}
         <Footer />
      </Providers>
      </body>
      </html>
   );
}
