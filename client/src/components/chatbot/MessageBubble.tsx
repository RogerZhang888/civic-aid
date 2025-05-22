import { memo } from "react";
import { Query } from "../types";
import { Image } from "lucide-react";
import React from "react";

function MessageBubble({
   message,
}: {
   message: Query;
}) {

   function getDomainFromUrl(url: string) {
      try {
         const urlObj = new URL(url);
         return urlObj.hostname;
      } catch (e) {
         console.error("Invalid URL:", e);
         return null;
      }
   }

   return (
      <React.Fragment key={message.question.slice(0, 5)}>         
         <div className="chat chat-end tracking-wide">
            <div className="chat-bubble space-y-1 whitespace-pre-wrap">
               {message.question && <div>{message.question}</div>}
               {message.media &&
                  <div className="text-xs flex items-center space-x-1">
                     <Image size={16} />
                     <span>Image attached</span>
                  </div>
               }
            </div>
         </div>
         <div className="chat chat-start tracking-wide sm:mb-3">
            <div className="chat-image avatar relative top-6 hidden sm:block">
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
            {message.sources && message.sources.length !== 0 &&
               <div className="chat-footer flex flex-row items-center mt-1 space-x-1">
                  <span>Sources:</span> 
                  {message.sources.map((source, idx) => 
                     <a 
                        key={idx}
                        className="link link-hover" 
                        href={source}
                        rel="noopener noreferrer" 
                        target="_blank"
                     >
                        {getDomainFromUrl(source)}
                     </a>
                  )}
               </div>
            }
         </div>

      </React.Fragment>
   );
}

export default memo(MessageBubble);
