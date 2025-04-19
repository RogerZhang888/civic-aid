import { Info } from "lucide-react";
import ChatbotForm from "./ChatbotForm";
import MessagesDisplay from "./MessagesDisplay";
import { useChatContext } from "./ChatContext";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL; 
import { Chat } from "../types"; 

export default function Chatbot() {
   const { chats, currChatId, coords, chatsDispatch } = useChatContext();
   const { chatId } = useParams();
   const [isLoading, setIsLoading] = useState(false);
   const [localChat, setLocalChat] = useState<Chat | null>(null);

   const currChat = chats.find(chat => chat.id === currChatId || chat.id === chatId) || localChat;

   useEffect(() => {
      if (!currChat && chatId) {
         const fetchChat = async () => {
            setIsLoading(true);
            try {
               const res = await axios.get(`${SERVER_API_URL}/api/chats/${chatId}`, { withCredentials: true });
               setLocalChat(res.data);
               chatsDispatch({ type: "ADD_NEW_CHAT", payload: res.data });
            } catch (error) {
               console.error("Failed to fetch chat:", error);
            } finally {
               setIsLoading(false);
            }
         };
         fetchChat();
      }
   }, [chatId, currChat]);

   if (isLoading) {
      return (
         <div className="h-full flex items-center justify-center">
            <div className="text-gray-500">Loading chat...</div>
         </div>
      );
   }

   if (!currChat) {
      return (
         <div className="h-full flex flex-1 flex-col">
            <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <img src="/mascot.png" alt="logo" className="w-50" />
               <div className="flex flex-row items-center space-x-3">
                  
                  <div className="text-2xl">
                     Your AI assistant for civic engagement!
                  </div>
               </div>
               <div>How can I help you today?</div>
               <ChatbotForm/>
            </div>
            <div className="sticky bottom-0">
               <div className="text-xs m-2 text-center text-gray-500">
                  {!coords && 
                     <div className="font-bold flex flex-row items-center justify-center gap-1">
                        <Info size={15} strokeWidth="3"/>This chatbot requires your location data for personalised recommendations.
                     </div>
                  }
                  <div >CivicAId can make mistakes. Check official government websites for important information.</div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="h-full flex flex-1 flex-col">
         <div className="flex-1 overflow-y-auto">
            <MessagesDisplay messages={currChat.queries} />
         </div>

         <div className="sticky bottom-0">
            <ChatbotForm/>
            <div className="text-xs m-2 text-center text-gray-500">
               {!coords && 
                  <div className="font-bold flex flex-row items-center justify-center gap-1">
                     <Info size={15} strokeWidth="3"/>This chatbot requires your location data for personalised recommendations.
                  </div>
               }
               <div>CivicAId can make mistakes. Check official government websites for important information.</div>
            </div>
         </div>
      </div>
   );
}
