import { Info } from "lucide-react";
import ChatbotForm from "./ChatbotForm";
import MessagesDisplay from "./MessagesDisplay";
import { useChatContext } from "./ChatContext";
import useTranslation from "../language/useTranslation";

export default function Chatbot() {

   const { chats, currChatId, coords, isFetchingAChat } = useChatContext();
   const { t } = useTranslation();

   const currChat = chats.find(chat => chat.id === currChatId);

   if (isFetchingAChat) return (
      <section className="h-full flex flex-1 flex-col justify-center items-center space-y-2">
         <span className="loading loading-spinner loading-xl"/>
         <div className="text-xl">{t('loadingChat')}</div>
      </section>
   )

   if (!currChat) {
      return (
         <div className="h-full flex flex-1 flex-col">
            <div className="flex-1 flex flex-col items-center justify-center space-y-3">
               <img src="/mascot.png" alt="logo" className="w-50" />
                  <div className="flex flex-row items-center space-x-3">
                     <div className="text-2xl">
                        {t('newChatTop')}
                     </div>
                  </div>
                  <div>{t('newChatBottom')}</div>
                  <ChatbotForm/>
               </div>
               <div className="sticky bottom-0">
                  <div className="text-xs m-2 text-center text-gray-500">
                     {!coords && 
                        <div className="font-semibold flex flex-row items-center justify-center gap-1">
                           <Info size={15} strokeWidth="3"/>{t('location')}
                        </div>
                     }
                  <div>{t("disclaimer")}</div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="h-full flex flex-1 flex-col">

         <div className="text-center text-lg font-semibold p-2">
            {currChat.title}
         </div>

         <div className="flex-1 overflow-y-auto px-4 pt-1">
            <MessagesDisplay messages={currChat.queries} />
         </div>

         <div className="sticky bottom-0">
            <ChatbotForm/>
            <div className="text-xs m-2 text-center text-gray-500">
               {!coords && 
                  <div className="font-semibold flex flex-row items-center justify-center gap-1">
                     <Info size={15} strokeWidth="3"/>{t('location')}
                  </div>
               }
               <div>{t("disclaimer")}</div>
            </div>
         </div>
      </div>
   );
}
