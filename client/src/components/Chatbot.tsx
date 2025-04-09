import { useState } from "react";
import toast from "react-hot-toast";
import MessagesDisplay from "./MessagesDisplay";
import { FormState, Message } from "./types";
import ChatbotForm from "./ChatbotForm";
import { useGeolocated } from "react-geolocated";
import axios, { AxiosError } from "axios";

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
   const [formState, setFormState] = useState<FormState>({ text: "", imgs: [] });
   const [imgsPreview, setImgsPreview] = useState<string[]>([]);

   const { coords } = useGeolocated({
      positionOptions: { enableHighAccuracy: false },
      userDecisionTimeout: 5000,
   });

   // main form submit function
   async function handleSubmitForm() {

      setIsWaitingForRes(true);

      // Add user message to messages array
      const { text, imgs } = formState;
      const thisQuery: Message = {
         id: messagesArr.length + 1,
         text,
         imgs,
         sender: "user",
         timestamp: new Date(),
      };
      setMessagesArr((prev) => [...prev, thisQuery]);

      // reset formState and image previews
      setFormState({ text: "", imgs: [] });
      setImgsPreview([]);

      // make the request body in the POST request
      const fd = new FormData();
      // append the text
      fd.append('prompt', formState.text);
      // append each image file
      formState.imgs.forEach(img => fd.append('images', img));
      // append user location data, if available
      if (coords) {
         fd.append('latitude', coords.latitude.toString());
         fd.append('longitude', coords.longitude.toString());
      }
      // append user info
      // this is just dummy for now
      fd.append('email', "john.doe@email.com");

      try {

         // send HTTP POST request
         // server MUST have cors and configured to accept multipart/form-data
         /* 
         
            eg.

            const multer = require('multer');
            const upload = multer({ dest: 'uploads/' });

            app.post('/api/queries', upload.array('images'), (req, res) => {
               console.log(req.files); // Array of file objects
            });

         */
         const res = await axios.post("http://localhost:5000/api/queries", fd,
            {
               maxContentLength: 100 * 1024 * 1024,
               maxBodyLength: 100 * 1024 * 1024,
               headers: { 'Content-Type': 'multipart/form-data' }
            }
         )

         // extract res data (this format might change later)
         const { reply, confidence } = res.data as { reply: string, confidence: number };

         const AIres: Message = {
            id: messagesArr.length + 2,
            text: `The reply was "${reply}" with confidence ${confidence}`,
            imgs: [],
            sender: "ai",
            timestamp: new Date(),
         };
         setMessagesArr((prev) => [...prev, AIres]);

      } catch (error) {

         if (error instanceof AxiosError) {

            const AIres: Message = {
               id: messagesArr.length + 2,
               text: error.message,
               imgs: [],
               sender: "ai",
               timestamp: new Date(),
            };
            setMessagesArr((prev) => [...prev, AIres]);
   
            console.error("Request error during submission:", error.message);

         } else {

            const AIres: Message = {
               id: messagesArr.length + 2,
               text: "An unknown error occured. Try again later.",
               imgs: [],
               sender: "ai",
               timestamp: new Date(),
            };
            setMessagesArr((prev) => [...prev, AIres]);
   
            console.error("Unknown error during submission:", error);

         }

      } finally {
         setIsWaitingForRes(false);
      }
   }

   // handle imgs upload
   function handleFormImgsChange(param: FileList | number) {

      if (param instanceof FileList) {
         // case: add files
   
         if (!param || param.length === 0) return;
   
         const newImgFiles = Array.from(param).filter((file) =>
            file.type.startsWith("image/")
         );
   
         if (newImgFiles.length !== param.length) {
            toast.error("Please upload only image files");
            return;
         }
   
         if (formState.imgs.length + newImgFiles.length > MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`);
            return;
         }
   
         setFormState((pv) => ({ ...pv, imgs: [...pv.imgs, ...newImgFiles] }));
   
         // Create preview URLs
         newImgFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) =>
               setImgsPreview((pv) => [
                  ...(pv || []),
                  event.target?.result as string,
               ]);
            reader.readAsDataURL(file);
         });

      } else {
         // case: remove files

         setFormState((pv) => ({ ...pv, imgs: pv.imgs.filter((_, i) => i !== param) }));
         setImgsPreview((pv) => pv?.filter((_, i) => i !== param) || null);

      }

   }

   // handle formState text change
   function handleFormTextChange(newText: string) {
      setFormState((pv) => ({ ...pv, text: newText }));
   }

   return (
      <div className="flex flex-col h-screen bg-gray-100">
         <div className="w-full mx-auto flex flex-col h-full tracking-wide">

            <div className="bg-blue-600 text-white p-4 shadow-md text-xl font-bold">
               Civic-AId
            </div>

            <MessagesDisplay messagesArr={messagesArr} />

            <ChatbotForm
               handleSubmitForm={handleSubmitForm}
               handleFormImgsChange={handleFormImgsChange}
               handleFormTextChange={handleFormTextChange}
               imgsPreview={imgsPreview}
               formState={formState}
               isWaitingForRes={isWaitingForRes}
            />

            <p className="text-xs m-2 text-center text-gray-500">
               AI-generated, for reference only.
            </p>

         </div>
      </div>
   );
}
