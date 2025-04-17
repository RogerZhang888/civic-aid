import { useParams } from "react-router";
import ChatSidebar from "./ChatSidebar";
import Chatbot from "./Chatbot";
import { useState } from "react";
import { Chat, Message } from "../types";

export default function ChatbotWrapper() {
   const { currChatId } = useParams<{ currChatId: string }>();

   const [chats, setChats] = useState<Chat[]>([]);

   function handleStartNewChat(newChatId: string, firstMessage: Message, newTitle: string) {
      setChats([
         ...chats,
         {
            id: newChatId,
            title: newTitle,
            messages: [firstMessage]
         }
      ]);
   }

   function handleUpdateChat(chatId: string, newMessage: Message) {
      setChats(prevChats => {
         const updatedChats = prevChats.map((chat) => {
            if (chat.id === chatId) {
               return {
                  ...chat,
                  messages: [...chat.messages, newMessage]
               };
            }
            return chat;
         });
         return updatedChats;
      });
   }

   return (
      <div className="flex flex-row h-full">
         <ChatSidebar currChatId={currChatId} chats={chats}/>
         <Chatbot 
            currChatId={currChatId}
            chats={chats}
            handleStartNewChat={handleStartNewChat}
            handleUpdateChat={handleUpdateChat}
         />
      </div>
   );
}