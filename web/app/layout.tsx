import Footer from "@/components/footer";
import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/providers";
import Navbar from "@/components/navbar";
import { nextFont as font } from "@/fonts";


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
         <Footer />
      </Providers>
      </body>
      </html>
   );
}
