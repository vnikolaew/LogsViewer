import { HubConnectionProvider } from "@/providers/LogsHubProvider";
import Home from "@/components/Home";
import { MarksProvider } from "@/providers/MarksProvider";
import Navbar from "@/components/navbar";

export default function Page() {
   return (
      <HubConnectionProvider>
         <MarksProvider>
            <Navbar />
            <main className="flex min-h-[80vh] flex-col items-start justify-start p-4 mt-4">
               <Home />
            </main>
         </MarksProvider>
      </HubConnectionProvider>
   );
}
