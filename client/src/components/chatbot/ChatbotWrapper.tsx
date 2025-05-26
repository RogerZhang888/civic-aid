import ChatSidebarDesktop from "./ChatSidebarDesktop";
import Chatbot from "./Chatbot";

export default function ChatbotWrapper() {

   return (
      <div className="flex flex-row h-full" id="chatbot">
         <title>CivicAId - Chat</title>
         <ChatSidebarDesktop/>
         <Chatbot/>
      </div>
   );
}