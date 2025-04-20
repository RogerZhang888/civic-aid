import { memo, useEffect, useRef } from "react";
import { Query } from "../types";
import MessageBubble from "./MessageBubble";

function MessagesDisplay({
   messages
}: {
   messages: Query[]
}) {

   const messagesEndRef = useRef<HTMLDivElement>(null);

   // Auto-scroll to bottom whenever messages changes
   useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

   return (
      
      <div className="p-4 text-lg">

         {messages.map(msg => <MessageBubble message={msg} key={msg.id}/>)}

         <div ref={messagesEndRef} />

      </div>
   );
}

export default memo(MessagesDisplay)