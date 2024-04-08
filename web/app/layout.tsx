import Footer from "@/components/footer";
import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/providers";
import Navbar from "@/components/navbar";
import { nextFont as font } from "@/fonts";
import FooterTwo from "@/components/footer/FooterTwo";


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
      <body className={font.className}>
      <Providers>
         <Navbar />
         {children}
         <FooterTwo />
      </Providers>
      </body>
      </html>
   );
}
