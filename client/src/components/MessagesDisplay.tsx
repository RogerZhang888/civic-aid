import { useEffect, useRef } from "react";
import { Message } from "./types";
import MessageBubble from "./MessageBubble";

export default function MessagesDisplay({
   messagesArr
}: {
   messagesArr: Message[]
}) {

   const messagesEndRef = useRef<HTMLDivElement>(null);

   // Format timestamp
   function formatTime(d: Date) {
      return d.toLocaleTimeString([], {
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   // Auto-scroll to bottom whenever messagesArr changes
   useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messagesArr]);

   return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-lg">

         {messagesArr.map(msg => <MessageBubble message={msg} formatTime={formatTime}/>)}

         <div ref={messagesEndRef} />

      </div>
   );
}