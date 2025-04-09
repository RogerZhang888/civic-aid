import { Message } from "./types";

export default function MessageBubble({
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
               <div className="rounded-lg px-4 py-2 break-words whitespace-pre-wrap bg-blue-500 text-white">
                  {message.text}
                  {message.imgs.length > 0 && (
                     <div className="text-xs opacity-80">
                        {message.imgs.length} image(s) attached
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
               {message.text}
            </div>
            <span className="text-xs mt-1 px-2 text-gray-500 text-left">
               {formatTime(message.timestamp)}
            </span>
         </div>
      </div>
   );
}
