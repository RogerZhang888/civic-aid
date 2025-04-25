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

   return (
      <div className="h-full flex flex-1 flex-col items-center mx-4 relative">

         {currChat
            ?  <>
                  <div className="text-lg font-semibold p-2">
                     {currChat.title}
                  </div>

                  <div className="flex-1 overflow-y-auto w-4/5">
                     <MessagesDisplay messages={currChat.queries} />
                  </div>
               </>
            :  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full">
                  <img src="/mascot.png" alt="logo" className="w-50 mx-auto" />
                  <div className="text-2xl">{t('newChatTop')}</div>
                  <div>{t('newChatBottom')}</div>
               </div>
         }

         <div className="mt-auto w-full max-w-2xl pt-3">
            <ChatbotForm/>
            <div className="text-xs text-center m-2 text-gray-500">
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
