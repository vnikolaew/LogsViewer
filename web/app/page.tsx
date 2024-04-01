import { HubConnectionProvider } from "@/providers/LogsHubProvider";
import Home from "@/components/Home";

export default function Page() {
   return (
      <HubConnectionProvider>
         <main className="flex min-h-screen flex-col items-start justify-start p-4">
            <Home />
         </main>
      </HubConnectionProvider>
   );
}
