"use client";
import React, { Fragment, useState } from "react";
import { signOut, useSession, signIn, getProviders } from "next-auth/react";
//@ts-ignore
import { UilGoogle, UilGithub } from "@iconscout/react-unicons";
import { User } from "next-auth";
import Image from "next/image";


interface UserInfoProps {
   user: User,
   token?: string
   providers?: AwaitedReturnTypeOf<typeof getProviders>
}

const UserInfo = ({ user, token, providers }: UserInfoProps) => {
   const session = useSession();
   const [users, setUsers] = useState<User[]>([]);

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
         .then(console.log)
         .catch(console.error);
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
         <div className={`my-4 flex items-center gap-2`}>
            {session?.status === `authenticated` && (
               <>
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
                  <button
                     onClick={_ => handlePromptOpenAI(`What's the capital of England?`)}
                     className={`btn btn-sm !px-4 btn-accent btn-outline`}>
                     Ask Open AI
                  </button>
               </>
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
                  <form action={`/api/auth/callback/credentials`} method={`POST`}>
                     <input hidden name={`email`} value={`email@gmail.com`} type={"email"} />
                     <input hidden name={`password`} value={`password`} type={"password"} />
                     <button
                        // onClick={_ => signIn(`credentials`, {})}
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