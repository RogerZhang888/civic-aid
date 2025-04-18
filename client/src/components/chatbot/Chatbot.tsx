import { Info } from "lucide-react";

import ChatbotForm from "./ChatbotForm";
import MessagesDisplay from "./MessagesDisplay";
import { useChatContext } from "./ChatContext";

export default function Chatbot() {

   const {
      chats,
      currChatId,
      coords
   } = useChatContext();

   const currChat = chats.find(chat => chat.id === currChatId);

   if (!currChat) {
      return (
         <div className="h-full flex flex-1 flex-col">
            {/* Main content - centered */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-3">
               <div className="flex flex-row items-center space-x-3">
                  <img
                     src="/DeepSeek.png"
                     alt="logo"
                     className="w-15"
                  />
                  <div className="text-2xl">
                     Your AI assistant for civic engagement!
                  </div>
               </div>
               <div>
                  How can I help you today?
               </div>
               <ChatbotForm/>
            </div>
         
            {/* Footer - sticky bottom */}
            <div className="sticky bottom-0 bg-white"> {/* Added bg-white to ensure visibility */}
               <div className="text-xs m-2 text-center text-gray-500">
                  {!coords && 
                  <div className="font-bold flex flex-row items-center justify-center gap-1">
                     <Info size={15} strokeWidth="3"/>This chatbot requires your location data for personalised recommendations.
                  </div>
                  }
                  <div>AI-generated, for reference only.</div>
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
               <div>AI-generated, for reference only.</div>
            </div>

         </div>

      </div>
   );
}
