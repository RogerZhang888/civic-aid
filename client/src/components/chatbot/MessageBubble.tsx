import { memo } from "react";
import { Message } from "../types";
import { Image } from "lucide-react";

function MessageBubble({
   message,
   formatTime,
}: {
   message: Message;
   formatTime: (d: Date) => string;
}) {
   // user message case
   if (message.sender === "user") {
      return (
         <div key={message.id} className="chat chat-end tracking-wide">
            <div className="chat-bubble space-y-1">
               {message.text && <div>{message.text}</div>}
               {message.imgs.length > 0 &&
                  <div className="text-xs flex items-center space-x-1">
                     <Image size={16} />
                     <span>{message.imgs.length} image(s) attached</span>
                  </div>
               }
            </div>
            <div className="chat-footer mt-1">
               {formatTime(message.timestamp)}
            </div>
         </div>
      );
   }

   // AI message case
   return (
      <div key={message.id} className="chat chat-start tracking-wide">
         <div className="chat-bubble chat-bubble-primary">
            {message.status === "pending" 
               ?  <span className="loading loading-dots loading-md"/>
               :  <div>{message.text}</div>
            }
         </div>
         <div className="chat-footer text-sm mt-1">
            {message.timestamp && formatTime(message.timestamp)}
         </div>
      </div>
   );
}

export default memo(MessageBubble);
