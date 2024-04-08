import React from "react";

export interface PageProps {
   params: { service: string };
}

const Page = ({ params: { service } }: PageProps) => {
   return (
      <div>
         Viewing Service: {service}
      </div>
   );
};

export default Page;
