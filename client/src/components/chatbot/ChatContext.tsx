import { createContext, useContext } from "react";
import { ChatContextType } from "../types";

export const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
   const ctx = useContext(ChatContext);
   if (ctx === null) {
      throw new Error("useChatContext must be used within a ChatProvider");
   }
   return ctx;
}