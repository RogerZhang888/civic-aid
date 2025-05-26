import { Info } from "lucide-react";
import ChatbotForm from "./ChatbotForm";
import MessagesDisplay from "./MessagesDisplay";
import { useChatContext } from "./ChatContext";
import useTranslation from "../../hooks/useTranslation";

export default function Chatbot() {

   const { chats, currChatId, coords, isFetchingAChat } = useChatContext();
   const { t } = useTranslation();

   const currChat = chats.find(chat => chat.id === currChatId);

   if (isFetchingAChat) return (
      <section className="h-full flex flex-1 flex-col justify-center items-center space-y-2 text-gray-500">
         <span className="loading loading-spinner loading-xl"/>
         <div className="text-xl">{t('loadingChat')}</div>
      </section>
   )

   return (
      <div className="h-full flex flex-1 flex-col items-center mx-4 static">

         <title>{`CivicAID - ${currChat ? currChat.title : "New Chat"}`}</title>

         {currChat
            ?  <>
                  <div className="hidden sm:block text-lg font-semibold p-2">
                     {currChat.title}
                  </div>

                  <div className="flex-1 overflow-y-auto w-full max-w-4xl sm:mt-0 mt-12">
                     <MessagesDisplay messages={currChat.queries} />
                  </div>
               </>
            :  <div className="h-fill flex flex-1 flex-col justify-center items-center w-full">
                  <img src="/mascot.png" alt="logo" className="w-50 mx-auto" />
                  <div className="text-2xl text-center">{t('newChatTop')}</div>
                  <div>{t('newChatBottom')}</div>
               </div>
         }

         <div className="w-full max-w-3xl pt-3 static mb-4 sm:mb-0">
            <ChatbotForm/>
            <div className="hidden sm:block text-xs text-center m-2 text-gray-500">
               {!coords && 
                  <div className="font-semibold flex flex-row items-center justify-center gap-1">
                     <Info size={15} strokeWidth="3"/>{t('location')}
                  </div>
               }
               <div className="">{t("disclaimer")}</div>
            </div>
         </div>
      </div>
   );
}
