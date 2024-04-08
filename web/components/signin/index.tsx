"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
//@ts-ignore
import { UilEnvelope, UilLock, UilEye, UilEyeSlash, UilGoogle, UilGithub, UilLinkedin } from "@iconscout/react-unicons";
import { signIn, SignInResponse } from "next-auth/react";

const LOGIN_PROVIDERS = [
   {
      name: `Google`,
      icon: <UilGoogle className={`text-red-500`} size={14} />,
      buttonClassName: `btn btn-sm !px-4 bg-white text-black !text-xs hover:bg-white hover:opacity-80 w-3/4`,
   },
   {
      name: `GitHub`,
      icon: <UilGithub size={14} />,
      buttonClassName: `btn btn-sm !px-4 btn-accent btn-ghost !text-xs w-3/4`,
   },
   {
      name: `LinkedIn`,
      icon: <UilLinkedin size={14} />,
      buttonClassName: `btn btn-sm !px-4 btn-primary text-white !text-xs w-3/4`,
   },
] as const;

interface SignInPageProps {
   token: string;
}

const SignInPage = ({ token }: SignInPageProps) => {
   const [formData, setFormData] = useState<{ email: string, password: string, errors?: string[] }>({
      email: ``,
      password: ``,
      errors: [],
   });
   const [showPassword, setShowPassword] = useState(false);
   const router = useRouter();

   function handleChange({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) {
      setFormData(x => ({ ...x, [name]: value }));
   }

   async function handleCredentialsSignIn(e: Event) {
      e.preventDefault();
      const response = await signIn(`credentials`, {
         email: formData.email,
         password: formData.password,
         csrfToken: token,
         redirect: false,
      });

      console.log({ response });
      if (response.ok) router.replace(`/`);
      else {
         setFormData(x => ({ ...x, errors: [response!.error!] }));
      }
   }

   return (
      <div className={`mx-12 my-12 min-h-[70vh] flex flex-col items-center justify-center`}>
         <div className={`card bg-base-200 shadow-lg`}>
            <div className={`card-body p-12 !px-16`}>
               <h2 className={`card-title`}>Sign in with your account</h2>
               <div>
                  <form className={`flex flex-col items-start`} method={`POST`}>
                     <div className="form-control w-full max-w-xs mt-4 ">
                        <div className="label">
                           <span className="label-text">E-mail:</span>
                        </div>
                        <label htmlFor={`email`}
                               className="!w-96 input input-sm input-bordered max-w-xs mt-0 flex items-center gap-2 ">
                           <UilEnvelope size={14} />
                           <input onChange={handleChange} value={formData.email} autoComplete={`off`} name={`email`}
                                  type="email" placeholder="Type your email"
                                  className=" grow " />
                        </label>
                        <div className="label">
                           <span className="label-text-alt text-red-500 text-xs">{formData.errors?.join(", ")}</span>
                        </div>
                     </div>
                     <div className="form-control w-full max-w-xs mt-4 ">
                        <div className="label">
                           <span className="label-text">Password:</span>
                        </div>
                        <label htmlFor={`password`}
                               className="input input-sm input-bordered max-w-xs mt-0 flex items-center gap-2 !w-96">
                           <UilLock size={14} />
                           <input onChange={handleChange} value={formData.password} autoComplete={`off`}
                                  name={`password`} type={showPassword ? "text" : "password"}
                                  placeholder="Type your password"
                                  className="grow w-full " />
                           <div onClick={_ => setShowPassword(!showPassword)} data-tip={showPassword ? `Hide` : `Show`}
                                className="tooltip cursor-pointer before:!text-xs">
                              {showPassword ? (
                                 <UilEyeSlash size={14} />
                              ) : (
                                 <UilEye size={14} />
                              )}
                           </div>
                        </label>
                        <div className="label">
                           <span className="label-text-alt text-red-500 text-xs">{formData.errors?.join(", ")}</span>
                        </div>
                     </div>
                     <div className={`w-full flex items-center justify-end mt-2`}>
                        <button
                           onClick={handleCredentialsSignIn}
                           className={`btn text-xs !px-8 !py-1.5 !h-fit !min-h-fit btn-sm btn-primary text-white self-end justify-self-end shadow-md`}>
                           Sign in
                        </button>
                     </div>
                     <div className={`divider mt-12 divider-neutral !h-[.5px] before:!h-[1px] after:!h-[1px] !text-xs`}>or sign in with</div>
                     <div className={`flex w-full flex-col gap-4 items-center mt-4`}>
                        {LOGIN_PROVIDERS.map((lp, i) => (
                           <button type={`submit`} className={lp.buttonClassName}
                                   onClick={async e => {
                                      e.preventDefault();
                                      const res: SignInResponse = await signIn(lp.name.toLowerCase(), {
                                         redirect: true,
                                         callbackUrl: `/`,
                                      });
                                      if (res.ok) {
                                         router.push(`/`);
                                      }
                                   }}
                                   key={i}>
                              {lp.icon}
                              {lp.name}
                           </button>
                        ))}
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
};

export default SignInPage;