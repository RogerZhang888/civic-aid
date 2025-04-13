import { useState } from "react";
import { User } from "../types";
import { UserContext } from "./UserContext";

export default function UserProvider({ children }: { children: React.ReactNode }) {
   const [currUser, setCurrUser] = useState<User | null>(null);

   function addUserState(u: User) {
      setCurrUser(u);
   }

   function removeUserState() {
      setCurrUser(null);
   }

   return (
      <UserContext.Provider 
         value={{
            currUser,
            removeUserState,
            addUserState
         }}
      >
         {children}
      </UserContext.Provider>
   );
};