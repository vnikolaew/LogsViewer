import Footer from "@/components/footer";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

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
      <html data-theme={`dark`} lang="en">
      <body className={inter.className}>
      {children}
      <Footer />
      </body>
      </html>
   );
}
