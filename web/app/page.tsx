import { HubConnectionProvider } from "@/providers/LogsHubProvider";
import Home from "@/components/Home";
import { MarksProvider } from "@/providers/MarksProvider";

export default function Page() {
   return (
      <HubConnectionProvider>
         <MarksProvider>
            <main className="flex min-h-screen flex-col items-start justify-start p-4">
               <Home />
            </main>
         </MarksProvider>
      </HubConnectionProvider>
   );
}
