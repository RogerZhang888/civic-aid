import { useState } from "react";
import toast from "react-hot-toast";
import MessagesDisplay from "./MessagesDisplay";
import { FormState, Message } from "./types";
import ChatbotForm from "./ChatbotForm";
import { useGeolocated } from "react-geolocated";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";

const initAIMsg: Message = {
   id: uuidv4(),
   text: "Hello! I'm Civic-AId. Type something and I'll repeat it back to you.",
   imgs: [],
   sender: "ai",
   timestamp: new Date(),
   status: "finished"
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

      const userMsgUUID = uuidv4();
      const aiMsgUUID = uuidv4();

      // generate user message
      const { text, imgs } = formState;
      const userMsg: Message = {
         id: userMsgUUID,
         text,
         imgs,
         sender: "user",
         timestamp: new Date(),
      };

      // generate pending AI message
      const pendingAiMsg: Message = {
         id: aiMsgUUID,
         text: "",
         imgs: [],
         sender: "ai",
         status: "pending",
      };

      // add both to messages array
      setMessagesArr(prev => [...prev, userMsg, pendingAiMsg])

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

         setMessagesArr(prev => prev.map(msg => 
            msg.id === pendingAiMsg.id
               ?  {
                  ...msg,
                  text: `The reply was "${reply}" with confidence ${confidence}`,
                  status: "finished",
                  timestamp: new Date()
               }
               :  msg
         ));

      } catch (error) {

         if (error instanceof AxiosError) {

            setMessagesArr(prev => prev.map(msg => 
               msg.id === pendingAiMsg.id 
               ?  { ...msg, text: error.message, status: "finished", timestamp: new Date() }
               :  msg
            ));
   
            console.error("Request error during submission:", error.message);

         } else {

            setMessagesArr(prev => prev.map(msg => 
               msg.id === pendingAiMsg.id 
               ?  { ...msg, text: "An unknown error occured. Try again later.", status: "finished", timestamp: new Date() }
               :  msg
            ));
   
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
