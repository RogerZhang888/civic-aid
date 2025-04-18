import { useParams } from "react-router";
import ChatSidebar from "./ChatSidebar";
import Chatbot from "./Chatbot";
import ChatProvider from "./ChatProvider";

export default function ChatbotWrapper() {
   const { currChatId } = useParams<{ currChatId: string }>();

   return (
      <div className="flex flex-row h-full">
         <ChatProvider currChatId={currChatId}>
            <ChatSidebar/>
            <Chatbot/>
         </ChatProvider>
      </div>
   );
}