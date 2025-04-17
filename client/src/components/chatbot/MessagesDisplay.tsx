import { memo, useEffect, useRef } from "react";
import { Message } from "../types";
import MessageBubble from "./MessageBubble";

function MessagesDisplay({
   messages
}: {
   messages: Message[]
}) {

   const messagesEndRef = useRef<HTMLDivElement>(null);

   // Format timestamp
   function formatTime(d: Date) {
      return d.toLocaleTimeString([], {
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   // Auto-scroll to bottom whenever messages changes
   useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

   return (
      <div className="overflow-y-auto p-4 text-lg">

         {messages.map(msg => <MessageBubble message={msg} formatTime={formatTime} key={msg.id} />)}

         <div ref={messagesEndRef} />

      </div>
   );
}

export default memo(MessagesDisplay)