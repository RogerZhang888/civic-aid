import { createContext, useContext } from "react";
import { UserContextType } from "../types";

export const UserContext = createContext<UserContextType | undefined>(undefined);

export default function useUserContext() {
   const ctx = useContext(UserContext);

   if (ctx === undefined) {
      throw new Error("useUserContext must be used within a UserProvider");
   }

   return ctx;
}