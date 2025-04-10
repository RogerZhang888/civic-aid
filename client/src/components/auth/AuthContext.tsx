import { createContext, useContext } from "react";
import { AuthContextType } from "../types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
   const ctx = useContext(AuthContext);

   if (ctx === undefined) {
      throw new Error("useAuth must be used within a AuthProvider");
   }

   return ctx;
}