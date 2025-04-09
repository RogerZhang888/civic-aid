import { useState } from "react";
import toast from "react-hot-toast";
import MessagesDisplay from "./MessagesDisplay";
import { Input, Message } from "./types";
import ChatbotForm from "./ChatbotForm";

const initAIMsg: Message = {
   id: 1,
   text: "Hello! I'm Civic-AId. Type something and I'll repeat it back to you.",
   imgs: [],
   sender: "ai",
   timestamp: new Date(),
};

const MAX_IMAGES = 3;

export default function Chatbot() {
   const [messagesArr, setMessagesArr] = useState<Message[]>([initAIMsg]);

   const [isWaitingForRes, setIsWaitingForRes] = useState<boolean>(false);

   const [input, setInput] = useState<Input>({ text: "", imgs: [] });

   const [imgsPreview, setImgsPreview] = useState<string[]>([]);

   async function handleSubmitQuery() {

      const { text, imgs } = input;
      
      // Add user message
      const thisQuery: Message = {
         id: messagesArr.length + 1,
         text,
         imgs,
         sender: "user",
         timestamp: new Date(),
      };

      setIsWaitingForRes(true);
      setMessagesArr(prev => [...prev, thisQuery]);

      // clear the textarea and imgs preview
      setInput({ text: "", imgs: [] });
      setImgsPreview([]);

      try {

         // simulate API response
         await new Promise((resolve) => setTimeout(resolve, 3000));

         // Add ai response
         const AIres: Message = {
            id: messagesArr.length + 2,
            text: `You said "${text}" and sent ${imgs.length} image(s)`,
            imgs: [],
            sender: "ai",
            timestamp: new Date(),
         };
         setMessagesArr((prev) => [...prev, AIres]);
         setIsWaitingForRes(false);

      } catch (error) {

         toast.error("Error during submission")
         console.error("Error during submission:", error);
         setIsWaitingForRes(false);
      }
   };

   // handle imgs upload
   function handleImagesUpload(fl: FileList | null) {
      if (!fl || fl.length === 0) return;
      
      const newImgFiles = Array.from(fl).filter(file => file.type.startsWith('image/'));
      
      if (newImgFiles.length !== fl.length) {
         toast.error('Please upload only image files');
         return;
      }

      if (input.imgs.length + newImgFiles.length > MAX_IMAGES) {
         toast.error(`Maximum ${MAX_IMAGES} images allowed`);
         return;
      }
      
      setInput(pv => ({ ...pv, imgs: [...pv.imgs, ...newImgFiles] }));
      
      // Create preview URLs
      newImgFiles.forEach(file => {
         const reader = new FileReader();
         reader.onload = (event) => setImgsPreview(pv => [...(pv || []), event.target?.result as string]);
         reader.readAsDataURL(file);
      });
   };

   // handle remove uploaded imgs
   function removeImage(idx: number) {
      setInput(pv => ({...pv, imgs: pv.imgs.filter((_, i) => i !== idx)}));
      setImgsPreview(pv => pv?.filter((_, i) => i !== idx) || null);
   };

   // handle input text change
   function handleInputTextChange(newText: string) {
      setInput(pv => ({...pv, text: newText}));
   }

   return (
      <div className="flex flex-col h-screen bg-gray-100">
         <div className="w-full mx-auto flex flex-col h-full tracking-wide">
            <div className="bg-blue-600 text-white p-4 shadow-md">
               <h1 className="text-xl font-bold">Civic-AId</h1>
            </div>

            <MessagesDisplay messagesArr={messagesArr}/>

            <ChatbotForm
               handleSubmitQuery={handleSubmitQuery}
               handleImagesUpload={handleImagesUpload}
               handleInputTextChange={handleInputTextChange}
               removeImage={removeImage}
               imgsPreview={imgsPreview}
               input={input}
               isWaitingForRes={isWaitingForRes}
            />

            <p className="text-xs m-2 text-center text-gray-500">AI-generated, for reference only.</p>

         </div>

      </div>
   );
}