import SignInPage from "@/components/signin";
import { getCsrfToken } from "next-auth/react";

const Page = async () => {
   const token = await getCsrfToken();
   return <SignInPage token={token!} />;
};

export default Page;