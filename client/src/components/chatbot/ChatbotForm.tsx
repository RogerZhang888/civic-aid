import { ArrowUp, Image, X } from "lucide-react";
import { useMemo, useRef } from "react"
import { useChatContext } from "./ChatContext";
import useTranslation from "../language/useTranslation";

export default function ChatbotForm() {

   const { t } = useTranslation();

   const {
      formState,
      imgPreview,
      handleAddQuery,
      updateFormImage,
      updateFormText,
      isWaiting,
   } = useChatContext();

   const fileInputRef = useRef<HTMLInputElement>(null);
   const textAreaRef = useRef<HTMLTextAreaElement>(null);

   // real-time input validation:
   // text between 0 and 400 charcters, inclusive
   // must have either text or image, or both, present
   const validationError = useMemo(() => {
      if (formState.text.length > 400) return t('messageTooLong');
      if (!formState.text.trim() && !formState.img) return t('emptyForm');
      return null;
   }, [formState.text, formState.img, t]);

   return (
      <form
         onSubmit={e => {
            e.preventDefault();
            if (validationError) return;
            handleAddQuery();
            if (textAreaRef.current) textAreaRef.current.style.height = 'auto';
         }}
         className="bg-gray-200 rounded-xl p-4 mt-2 w-4/5 md:w-2/3 mx-auto
         flex flex-col relative shadow-lg"
      >  
         {imgPreview && 
            <div className="flex flex-row space-x-3 mb-3">
               <div className="relative text-center bg-gray-300 rounded-lg p-1">
                  <img 
                     src={imgPreview}
                     alt="Preview"
                     className="max-h-20 rounded-lg"
                  />
                  <div className="text-sm text-gray-700 truncate max-w-[100px]">
                     {formState.img?.name}
                  </div>
                  <button
                     type="button"
                     onClick={() => updateFormImage(null)}
                     className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1
                     hover:bg-gray-700 hover:cursor-pointer transition duration-300 ease-in-out"
                  >
                     <X size={16} />
                  </button>
               </div>
            </div>
         }

         <textarea
            placeholder={t('textArea')}
            ref={textAreaRef}
            value={formState.text}
            rows={1}
            onChange={e => {
               const ta = e.target;
               if (ta) {
                  ta.style.height = 'auto';
                  ta.style.height = `${ta.scrollHeight}px`;
               }
               updateFormText(ta.value)
            }}
            onKeyDown={e => {
               if (e.key === 'Enter' && !e.shiftKey) {
                  // Shift + Enter starts a new line
                  // Enter on its own will submit the form
                  e.preventDefault();
                  if (validationError) return;
                  handleAddQuery();
                  if (textAreaRef.current) textAreaRef.current.style.height = 'auto';
               }
            }}
            className="w-full h-full resize-none overflow-hidden focus:outline-none mb-10"
         />

         <div className="absolute flex flex-row space-x-2 right-2 bottom-2">

            <input
               type="file"
               ref={fileInputRef}
               onChange={e => {

                  const { files } = e.target;
                  if (!files || files.length === 0) return;

                  updateFormImage(files[0]);
               }}
               accept="image/*"
               className="hidden"
            />

            <div className="relative group">
               <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!formState.img}
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
                  {!formState.img
                     ?  t('uploadImage')
                     :  t('maxImage')
                  }
               </div>
            </div>

            <div className="relative group">
               <button
                  type="submit"
                  disabled={isWaiting || !!validationError}
                  className=" 
                  bg-primary text-white rounded-full p-2 w-10 h-10 flex justify-center items-center 
                  disabled:opacity-50 disabled:cursor-default 
                  hover:bg-secondary hover:cursor-pointer disabled:hover:bg-primary disabled:hover:cursor-not-allowed
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