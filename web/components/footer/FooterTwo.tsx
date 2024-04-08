import React from "react";
import Image from "next/image";
import favicon from "../../public/favicon.ico"

//@ts-ignore
import { UilInstagram, UilFacebook, UilSlack, UilTwitter } from "@iconscout/react-unicons";

const FooterTwo = () => {
   return (
      <footer className="bg-base-200 mt-16 bg-cover bg-center text-white">
         <div className="divider divider-base-100 !h-fit w-full"></div>
         <div className="mx-auto w-full pb-6 max-w-7xl px-5 pt-8 md:px-10 md:pt-12 lg:pt-16">
            <div className="flex flex-col items-center">
               <a href="#" className="mb-4 inline-block max-w-full">
                  <Image
                     width={32}
                     height={32}
                     src={favicon}
                     alt="" className="inline-block max-h-10" />
               </a>
               <div className="text-center !text-base-content font-semibold max-[991px]:ml-0 max-[991px]:mr-0 max-[991px]:py-1">
                  <a href="#"
                     className="inline-block px-4 py-2 font-normal transition hover:text-neutral-500">About</a>
                  <a href="#"
                     className="inline-block px-4 py-2 font-normal transition hover:text-neutral-500">Features</a>
                  <a href="#"
                     className="inline-block px-4 py-2 font-normal transition hover:text-neutral-500">Works</a>
                  <a href="#"
                     className="inline-block px-4 py-2 font-normal transition hover:text-neutral-500">Support</a>
                  <a href="#" className="inline-block px-6 py-2 font-normal transition hover:text-neutral-500">Help</a>
               </div>
               <div className="my-4 w-48 border-b border-solid border-b-base-content"></div>
               <div className="mb-8 grid w-full max-w-[208px] grid-flow-col grid-cols-4 gap-3">
                  <a href="#" className="ifont-bold mx-auto flex max-w-[24px] flex-col">
                     <button className={`btn btn-sm btn-circle btn-outline`}>
                        <UilInstagram size={12} />
                     </button>
                  </a>
                  <a href="#" className="mx-auto flex max-w-[24px] flex-col font-bold">
                     <button className={`btn btn-sm btn-circle btn-outline`}>
                        <UilFacebook size={12} />
                     </button>
                  </a>
                  <a href="#" className="ifont-bold mx-auto flex max-w-[24px] flex-col">
                     <button className={`btn btn-sm btn-circle btn-outline`}>
                        <UilTwitter size={12} />
                     </button>
                  </a>
                  <a href="#" className="mx-auto flex max-w-[24px] flex-col font-bold">
                     <button className={`btn btn-sm btn-circle btn-outline`}>
                        <UilSlack size={12} />
                     </button>
                  </a>
               </div>
               <p className="max-[479px]:text-sm mt-4 !text-xs !text-base-content">© Copyright {new Date().getFullYear()}. All rights
                  reserved.</p>
            </div>
         </div>
      </footer>
   );
};

export default FooterTwo;