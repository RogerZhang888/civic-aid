import { ArrowUp, Image, X } from "lucide-react";
import { useMemo, useRef } from "react"
import { Input } from "./types"

export default function ChatbotForm({
   handleSubmitQuery,
   handleImagesUpload,
   handleInputTextChange,
   removeImage,
   imgsPreview,
   input,
   isWaitingForRes,
}: {
   handleSubmitQuery: () => Promise<void>
   handleImagesUpload: (x: FileList | null) => void
   handleInputTextChange: (x: string) => void
   removeImage: (x: number) => void
   imgsPreview: string[]
   input: Input
   isWaitingForRes: boolean
}) {

   const fileInputRef = useRef<HTMLInputElement>(null);
   const textAreaRef = useRef<HTMLTextAreaElement>(null);

   // real-time input validation:
   // text between 0 and 400 charcters, inclusive
   // must have either text or image, or both, present
   const validationError = useMemo(() => {
      if (input.text.length > 400) return "Message must be ≤400 characters";
      if (!input.text.trim() && input.imgs.length === 0) return "Message or image required";
      return null;
   }, [input.text, input.imgs.length]);

   return (
      <form
         onSubmit={e => {
            e.preventDefault();
            if (validationError) return;
            handleSubmitQuery();
            if (textAreaRef.current) textAreaRef.current.style.height = 'auto';
         }}
         className=" bg-gray-200 rounded-xl p-4 mt-2 w-2/3 mx-auto
         flex flex-col relative shadow-lg"
      >  
         {imgsPreview.length > 0 && 
            <div className="flex flex-row space-x-3 mb-3">
               {imgsPreview.map((prv, idx) => (
                  <div key={idx} className="relative text-center bg-gray-300 rounded-lg p-1">
                     <img 
                        src={prv}
                        alt={`Preview image ${idx + 1}`}
                        className="max-h-20 rounded-lg"
                     />
                     <div className="text-sm text-gray-700 truncate max-w-[100px]">
                        {input.imgs[idx]?.name}
                     </div>
                     <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1
                        hover:bg-gray-700 hover:cursor-pointer transition duration-300 ease-in-out"
                     >
                        <X size={16} />
                     </button>
                  </div>
               ))}
            </div>
         }

         <textarea
            placeholder="Ask anything"
            ref={textAreaRef}
            value={input.text}
            rows={1}
            onChange={e => {
               const ta = e.target;
               if (ta) {
                  ta.style.height = 'auto';
                  ta.style.height = `${ta.scrollHeight}px`;
               }
               handleInputTextChange(ta.value)
            }}
            className="w-full h-full resize-none overflow-hidden focus:outline-none mb-10"
         />

         <div className="absolute flex flex-row space-x-2 right-2 bottom-2">

         <input
            type="file"
            ref={fileInputRef}
            onChange={e => handleImagesUpload(e.target.files)}
            accept="image/*"
            multiple
            className="hidden"
         />

            <div className="relative group">
               <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={input.imgs.length >= 3}
                  className=" 
                     text-black bg-white rounded-full p-2 w-10 h-10 flex justify-center items-center 
                     disabled:opacity-50 disabled:cursor-default
                     hover:bg-gray-300 hover:cursor-pointer disabled:hover:bg-white disabled:hover:cursor-not-allowed
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
                  {input.imgs.length < 3
                     ?  "Upload an image"
                     :  "Max: 3 images"
                  }
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
   );
}