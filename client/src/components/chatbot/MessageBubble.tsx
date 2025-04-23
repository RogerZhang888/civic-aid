import { memo } from "react";
import { Query } from "../types";
import { Image } from "lucide-react";
import React from "react";

function MessageBubble({
   message,
}: {
   message: Query;
}) {

   return (
      <React.Fragment key={message.id}>         
         <div className="chat chat-end tracking-wide mt-3">
            <div className="chat-bubble space-y-1">
               {message.question && <div>{message.question}</div>}
               {message.img &&
                  <div className="text-xs flex items-center space-x-1">
                     <Image size={16} />
                     <span>Image attached</span>
                  </div>
               }
            </div>
         </div>
         <div className="chat chat-start tracking-wide">
            <div className="chat-image avatar relative top-6">
               <div className="w-15 rounded-full">
                  <img src="/mascot.png" alt="logo" />
               </div>
            </div>
            <div className="chat-bubble chat-bubble-primary">
               {message.status === "pending" 
                  ? <span className="loading loading-dots loading-md" />
                  : <div>{message.answer}</div>
               }
            </div>
         </div>

      </React.Fragment>
   );
}

export default memo(MessageBubble);
