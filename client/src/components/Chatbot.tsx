import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUp } from "lucide-react";

type Message = {
   id: number;
   text: string;
   sender: "user" | "ai";
   timestamp: Date;
};

type FormValues = {
   input: string;
};

const FormZodSchema = z.object({
   input: z.string()
      .trim()
      .nonempty({ message: "Your message cannot be empty" })
      .max(500, { message: "Your message is too long (max 500 characters)" })
})

const initAIMsg: Message = {
   id: 1,
   text: "Hello! I'm Civic-AId. Type something and I'll repeat it back to you.",
   sender: "ai",
   timestamp: new Date(),
};

export default function Chatbot() {
   const [messagesArr, setMessagesArr] = useState<Message[]>([initAIMsg]);
   const [isWaitingForRes, setIsWaitingForRes] = useState<boolean>(false);

   const messagesEndRef = useRef<HTMLDivElement>(null);

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isValid, isDirty },
   } = useForm<FormValues>({
      resolver: zodResolver(FormZodSchema),
      defaultValues: { input: '' },
      mode: 'onChange',
      reValidateMode: 'onChange',
   });

   async function handleSubmitMessage(dat: FormValues) {

      try {

         setIsWaitingForRes(true);

         // Add user message
         const userMessage: Message = {
            id: messagesArr.length + 1,
            text: dat.input,
            sender: "user",
            timestamp: new Date(),
         };
         setMessagesArr((prev) => [...prev, userMessage]);
         reset();

         await new Promise((resolve) => setTimeout(resolve, 3000));

         // Add ai response
         const botMessage: Message = {
            id: messagesArr.length + 2,
            text: `You said: "${dat.input}"`,
            sender: "ai",
            timestamp: new Date(),
         };
         setMessagesArr((prev) => [...prev, botMessage]);
         setIsWaitingForRes(false);

      } catch (error) {

         console.error("Error during submission:", error);
         setIsWaitingForRes(false);

      }
   };

   // Format timestamp
   function formatTime(d: Date) {
      return d.toLocaleTimeString([], {
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   // resize the text area when text wraps
   function handleTextAreaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      const ta = e.target;
      if (ta) {
         ta.style.height = 'auto';
         ta.style.height = `${ta.scrollHeight}px`;
      }
   }

   // Auto-scroll to bottom when messagesArr changes
   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messagesArr]);


   console.log("is valid: " + isValid)
   console.log("is dirty: " + isDirty)

   return (
      <div className="flex flex-col h-screen bg-gray-100">
         <div className="w-full mx-auto flex flex-col h-full tracking-wide">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 shadow-md">
               <h1 className="text-xl font-bold">Civic-AId</h1>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-lg">
               {messagesArr.map(msg => (
                  <div
                     key={msg.id}
                     className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                     <div className="flex flex-col max-w-[80%]">
                        <div
                           className={`rounded-lg px-4 py-2 break-words whitespace-pre-wrap ${
                              msg.sender === "user"
                                 ? "bg-blue-500 text-white"
                                 : "bg-gray-200 text-gray-800"
                           }`}
                        >
                           {msg.text}
                        </div>
                        <span
                           className={`text-xs mt-1 px-2 text-gray-500 ${
                              msg.sender === "user"
                                 ? "text-right"
                                 : "text-left"
                           }`}
                        >
                           {formatTime(msg.timestamp)}
                        </span>
                     </div>
                  </div>
               ))}
               <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form 
               onSubmit={handleSubmit(handleSubmitMessage)}
               className=" bg-gray-200 rounded-xl p-4 m-4
               flex flex-col"
            >
               <textarea
                  {...register('input', { onChange: handleTextAreaChange })}
                  placeholder="Ask anything"
                  rows={1}
                  onKeyDown={e => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (isValid && isDirty && !isWaitingForRes) {
                           handleSubmit(handleSubmitMessage)();
                        }
                     }
                  }}
                  className="w-full resize-none overflow-hidden focus:outline-none mb-3"
               />

               <div className="ms-auto flex flex-row items-center space-x-4">
                  <div className=" text-red-500">
                     {errors.input?.message}
                  </div>

                  <button
                     type="submit"
                     disabled={!isValid || isWaitingForRes || !isDirty}
                     className=" 
                     bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex justify-center items-center 
                     disabled:opacity-50 disabled:cursor-default 
                     hover:bg-blue-700 hover:cursor-pointer disabled:hover:bg-blue-600 disabled:hover:cursor-default
                     transition duration-300 ease-in-out"
                  >
                     <ArrowUp strokeWidth={3} size={25}/>
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}