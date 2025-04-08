import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowUp, Image, X } from "lucide-react";
import clsx from "clsx";

type Message = {
   id: number;
   text: string;
   img: File | null;
   sender: "user" | "ai";
   timestamp: Date;
};

type Input = {
   text: string;
   img: File | null;
};

const initAIMsg: Message = {
   id: 1,
   text: "Hello! I'm Civic-AId. Type something and I'll repeat it back to you.",
   img: null,
   sender: "ai",
   timestamp: new Date(),
};

export default function Chatbot() {
   const [messagesArr, setMessagesArr] = useState<Message[]>([initAIMsg]);

   const [isWaitingForRes, setIsWaitingForRes] = useState<boolean>(false);

   const [input, setInput] = useState<Input>({ text: "", img: null });

   const [imgPreview, setImgPreview] = useState<string | null>(null);

   const messagesEndRef = useRef<HTMLDivElement>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const textAreaRef = useRef<HTMLTextAreaElement>(null);

   async function handleSubmitQuery(e: React.FormEvent) {

      e.preventDefault();

      if (validationError) return;

      const { text, img } = input;
      
      // Add user message
      const thisQuery: Message = {
         id: messagesArr.length + 1,
         text,
         img,
         sender: "user",
         timestamp: new Date(),
      };

      setIsWaitingForRes(true);
      setMessagesArr(prev => [...prev, thisQuery]);

      // clear the textarea and img preview
      setInput({ text: "", img: null });
      setImgPreview(null);

      // resize the text area
      if (textAreaRef.current) textAreaRef.current.style.height = 'auto';

      try {

         // simulate API response
         await new Promise((resolve) => setTimeout(resolve, 3000));

         // Add ai response
         const AIres: Message = {
            id: messagesArr.length + 2,
            text: `You said: "${text}" ${img ? "and sent an image" : ""}`,
            img: null,
            sender: "ai",
            timestamp: new Date(),
         };
         setMessagesArr((prev) => [...prev, AIres]);
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

   // handle img upload
   function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
  
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
         alert('Please upload an image file');
         return;
      }
  
      setInput(prev => ({ ...prev, img: file }));
  
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
         setImgPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
   };

   // handle remove uploaded img
   function removeImage() {
      setInput(prev => ({ ...prev, img: null }));
      setImgPreview(null);
      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
   };

   // real-time input validation:
   // text between 0 and 400 charcters, inclusive
   // must have either text or image, or both, present
   const validationError = useMemo(() => {
      if (input.text.length > 400) return "Message must be ≤400 characters";
      if (!input.text.trim() && !input.img) return "Message or image required";
      return null;
   }, [input]);

   // Auto-scroll to bottom when messagesArr changes
   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messagesArr]);

   return (
      <div className="flex flex-col h-screen bg-gray-100">
         <div className="w-full mx-auto flex flex-col h-full tracking-wide">
            <div className="bg-blue-600 text-white p-4 shadow-md">
               <h1 className="text-xl font-bold">Civic-AId</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-lg">
               {messagesArr.map(msg => (
                  <div
                     key={msg.id}
                     className={clsx("flex", {
                        "justify-end": msg.sender === "user",
                        "justify-start": msg.sender === "ai"
                     })}
                  >
                     <div className="flex flex-col max-w-[80%]">
                        <div
                           className={clsx("rounded-lg px-4 py-2 break-words whitespace-pre-wrap", {
                              "bg-blue-500 text-white": msg.sender === "user",
                              "bg-gray-200 text-gray-800": msg.sender === "ai"
                           })}
                        >
                           {msg.text}
                        </div>
                        <span
                           className={clsx("text-xs mt-1 px-2 text-gray-500", {
                              "text-right": msg.sender === "user",
                              "text-left": msg.sender === "ai"
                           })}
                        >
                           {formatTime(msg.timestamp)}
                        </span>
                     </div>
                  </div>
               ))}
               <div ref={messagesEndRef} />
            </div>

            <form
               onSubmit={handleSubmitQuery}
               className=" bg-gray-200 rounded-xl p-4 mt-2 w-2/3 mx-auto
               flex flex-col relative shadow-lg"
            >
               {imgPreview && (
                  <div className="relative w-fit mb-3 text-center bg-gray-300 rounded-lg p-1">
                     <img 
                        src={imgPreview}
                        alt="Image preview" 
                        className="max-h-35 rounded-lg"
                     />
                     <div className="text-sm text-gray-700 truncate max-w-[100px]">
                        {input.img?.name}
                     </div>
                     <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2
                        bg-black text-white rounded-full p-1 
                        hover:bg-gray-700 
                        hover:cursor-pointer
                        transition duration-300 ease-in-out"
                     >
                        <X size={18} />
                     </button>
                  </div>
               )}

               <textarea
                  ref={textAreaRef}
                  placeholder="Ask anything"
                  value={input.text}
                  rows={1}
                  onChange={e => {
                     setInput(pv => ({...pv, text: e.target.value}));
                     handleTextAreaChange(e);
                  }}
                  className="w-full h-full resize-none overflow-hidden focus:outline-none mb-10"
               />

               <div className="absolute flex flex-row space-x-2 right-2 bottom-2">

                  <input
                     type="file"
                     ref={fileInputRef}
                     onChange={handleImageUpload}
                     accept="image/*"
                     className="hidden"
                  />

                  <div className="relative group">
                     <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className=" 
                           text-black bg-white rounded-full p-2 w-10 h-10 flex justify-center items-center 
                           disabled:opacity-50 disabled:cursor-default
                           hover:bg-gray-300 hover:cursor-pointer disabled:hover:bg-white disabled:hover:cursor-default
                           transition duration-300 ease-in-out"
                     >
                        <Image strokeWidth={2} size={25} />
                     </button>

                     <div className="
                        absolute bottom-full mb-1 left-1/2 -translate-x-1/2 
                        bg-gray-800 text-white text-xs px-2 py-1 rounded 
                        opacity-0 group-hover:opacity-100 
                        transition-opacity duration-300 
                        pointer-events-none whitespace-nowrap
                        z-10"
                     >
                        Upload an image
                     </div>
                  </div>

                  <div className="relative group">
                     <button
                        type="submit"
                        disabled={isWaitingForRes || !!validationError}
                        className=" 
                        bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex justify-center items-center 
                        disabled:opacity-50 disabled:cursor-default 
                        hover:bg-blue-900 hover:cursor-pointer disabled:hover:bg-blue-600 disabled:hover:cursor-not-allowed
                        transition duration-300 ease-in-out"
                     >
                        <ArrowUp strokeWidth={3} size={25}/>
                     </button>

                     {validationError && 
                        <div className="
                           absolute bottom-full mb-1 left-1/2 -translate-x-1/2 
                           bg-gray-800 text-white text-xs px-2 py-1 rounded 
                           opacity-0 group-hover:opacity-100 
                           transition-opacity duration-300 
                           pointer-events-none
                           z-10 w-[150px] text-center"
                        >
                           {validationError}
                        </div>
                     }

                  </div>

               </div>

            </form>

            <p className="text-xs m-2 text-center text-gray-500">AI-generated, for reference only.</p>

         </div>

      </div>
   );
}