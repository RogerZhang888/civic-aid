import { memo } from "react";
import { Message } from "./types";
import { Image } from "lucide-react";
import BeatLoader from "react-spinners/BeatLoader"

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
         <div key={message.id} className="flex justify-end">
            <div className="flex flex-col max-w-[80%]">
               <div className="rounded-lg px-4 py-2 break-words whitespace-pre-wrap bg-blue-500 text-white space-y-2">
                  <div>{message.text}</div>
                  {message.imgs.length > 0 && (
                     <div className="text-xs flex items-center space-x-1">
                        <Image size={16} />
                        <span>{message.imgs.length} image(s) attached</span>
                     </div>
                  )}
               </div>
               <span className="text-xs mt-1 px-2 text-gray-500 text-right">
                  {formatTime(message.timestamp)}
               </span>
            </div>
         </div>
      );
   }

   // AI message case
   return (
      <div key={message.id} className="flex justify-start">
         <div className="flex flex-col max-w-[80%]">
            <div className="rounded-lg px-4 py-2 break-words whitespace-pre-wrap bg-gray-200 text-gray-800">
               {message.status === "pending" 
                  ?  <BeatLoader
                        size={9}
                        color="#2b7fff"
                        className="-my-1"
                     />
                  :  <div>{message.text}</div>
               }
            </div>
            <span className="text-xs mt-1 px-2 text-gray-500 text-left">
               {message.timestamp && formatTime(message.timestamp)}
            </span>
         </div>
      </div>
   );
}

export default memo(MessageBubble);
