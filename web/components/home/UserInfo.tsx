"use client";
import React, { Fragment, useState } from "react";
import { signOut, useSession, signIn, getProviders, SignInResponse } from "next-auth/react";
//@ts-ignore
import { UilGoogle, UilGithub, UilLinkedin } from "@iconscout/react-unicons";
import { User } from "next-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Simulate } from "react-dom/test-utils";
import error = Simulate.error;


interface UserInfoProps {
   user: User,
   token?: string
   providers?: AwaitedReturnTypeOf<typeof getProviders>
}

const UserInfo = ({ user, token, providers }: UserInfoProps) => {
   const session = useSession();
   const [users, setUsers] = useState<User[]>([]);
   const [formData, setFormData] = useState<{ email: string, password: string, errors?: string[] }>({
      email: ``,
      password: ``,
      errors: [],
   });
   const [prompt, setPrompt] = useState(``);
   const [answer, setAnswer] = useState(``);

   const router = useRouter();

   async function handleFetchUsers() {
      await fetch(`/api/users`, {})
         .then(res => res.json())
         .then((users: User[]) => {
            console.log(users);
            setUsers(users);
         })
         .catch(console.error);
   }

   async function handleFetchUser(id: string) {
      await fetch(`/api/users/${id}`, {})
         .then(res => res.json())
         .then(console.log)
         .catch(console.error);
   }

   async function handlePromptOpenAI(prompt: string) {
      await fetch(`/api/ai?prompt=${prompt}`, {})
         .then(res => res.json())
         .then(res => {
            console.log(res);
            setAnswer(res.kwargs.content);
         })
         .catch(console.error);
   }

   async function handleCredentialsSignIn(e) {
      e.preventDefault();

      const response: SignInResponse = await signIn(`credentials`, {
         email: formData.email,
         password: formData.password,
         csrfToken: token,
         redirect: false,
      });

      console.log({ response });
      if (response.ok) router.refresh();
      else {
         setFormData(x => ({ ...x, errors: [response.error!] }));
      }
   }

   function handleChange({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) {
      setFormData(x => ({ ...x, [name]: value }));
   }

   return (
      <div className={`w-full mb-8`}>
         <div className="flex items-start justify-start w-full gap-4">
            <div className={`avatar`}>
               <div className={`w-12 rounded-full`}>
                  {user?.image && (
                     <Image className={`shadow-md`} height={60} width={60} src={user?.image!.trim()}
                            alt={`User profile picture`} />
                  )}
               </div>
            </div>
            <div className={`flex flex-col items-start gap-2`}>
               <pre className={`text-xs`}>{JSON.stringify(user, null, 2)}</pre>
               <pre className={`text-xs`}>{JSON.stringify(session, null, 2)}</pre>
            </div>
         </div>
         <div className={`my-4 flex flex-col items-start gap-2`}>
            {session?.status === `authenticated` && (
               <div className={`my-0 flex items-center gap-2`}>
                  <button
                     onClick={_ => signOut()}
                     className={`btn btn-sm !px-4 btn-primary btn-outline`}>
                     Sign Out
                  </button>
                  <button
                     onClick={_ => handleFetchUsers()}
                     className={`btn btn-sm !px-4 btn-accent btn-outline`}>
                     Fetch users
                  </button>
                  <input
                     onChange={e => setPrompt(e.target.value)}
                     placeholder={`What's 2+2?`}
                     value={prompt}
                     className={`input ml-8 !w-80 input-sm input-bordered`}></input>
                  <button
                     onClick={_ => handlePromptOpenAI(prompt)}
                     className={`btn btn-sm !px-4 btn-accent btn-outline`}>
                     Ask Open AI
                  </button>
               </div>
            )}
            {answer?.length > 0 && (
               <div className={`text-sm mt-4`}>
                  <span className={`font-bold mx-2`}>
                   Anthropic answer:
                  </span>
                   {answer}
               </div>
            )}
            {!!users?.length && users.map((user, i) => (
               <button onClick={() => handleFetchUser(user.id)} className={`flex items-center gap-2 btn btn-ghost`}
                       key={user.id}>
                  <div className={`avatar`}>
                     <div className={`w-8 rounded-full`}>
                        <Image height={60} width={60} src={user.image!} alt={`User profile picture`} />
                     </div>
                  </div>
                  <span className={`text-sm`}>{user.name}</span>
               </button>
            ))}
            {!user && (
               <Fragment>
                  <button
                     onClick={_ => signIn(`google`, { redirect: true })}
                     className={`btn btn-sm !px-4 btn-warning`}>
                     <UilGoogle size={14} />
                     Sign In with Google
                  </button>
                  <button
                     onClick={_ => signIn(`github`, { redirect: true })}
                     className={`btn btn-sm !px-4 btn-accent btn-ghost`}>
                     <UilGithub size={14} />
                     Sign In with GitHub
                  </button>
                  <button
                     onClick={_ => signIn(`linkedin`, { redirect: true })}
                     className={`btn btn-sm !px-4 btn-primary text-white`}>
                     <UilLinkedin size={14} />
                     Sign In with LinkedIn
                  </button>
                  <form className={`flex flex-col gap-4 `}>
                     <input name="csrfToken" type="hidden" defaultValue={token} />
                     <input className={`input input-bordered input-sm`} onChange={handleChange} name={`email`}
                            value={formData.email}
                            type={"email"} />
                     <input className={`input input-bordered input-sm`} onChange={handleChange} name={`password`}
                            value={formData.password} type={"password"} />
                     {formData.errors && (
                        <div className={`text-red-500 text-xs`}>{formData.errors.join(", ")}</div>
                     )}
                     <button
                        onClick={handleCredentialsSignIn}
                        type={"submit"}
                        className={`btn btn-sm !px-4 btn-secondary`}>
                        Sign In with E-mail
                     </button>
                  </form>
               </Fragment>
            )}
         </div>
      </div>
   );
};

export default UserInfo;