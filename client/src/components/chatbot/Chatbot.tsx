import { useState } from "react";
import toast from "react-hot-toast";
import MessagesDisplay from "./MessagesDisplay";
import { FormState, Message } from "../types";
import ChatbotForm from "./ChatbotForm";
import { useGeolocated } from "react-geolocated";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import useUser from "../auth/useUser";
import { Info } from "lucide-react";

const initAIMsg: Message = {
   id: uuidv4(),
   text: "Hello! I'm Civic-AId. If you want to ask a question, type 'question'. If you want to report an issue, type 'report'.",
   sender: "ai",
   timestamp: new Date(),
   status: "finished"
};

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function Chatbot() {
   const [messagesArr, setMessagesArr] = useState<Message[]>([initAIMsg]);
   const [isWaitingForRes, setIsWaitingForRes] = useState<boolean>(false);
   const [formState, setFormState] = useState<FormState>({ text: "", img: null });
   const [imgPreview, setImgPreview] = useState<string | null>(null);   

   // get user's coordinates
   // browser will ask for permission
   // if no permission granted, wont be sent in formdata
   const { coords } = useGeolocated({
      positionOptions: { enableHighAccuracy: false },
      userDecisionTimeout: 5000,
   });

   const { data: user, isLoading } = useUser();

   const { id: userId, email: userEmail } = user!;

   if (isLoading) return <div>Loading chatbot...</div>

   // main form submit function
   async function handleSubmitForm() {

      setIsWaitingForRes(true);

      const userMsgUUID = uuidv4();
      const aiMsgUUID = uuidv4();

      // generate user message
      const { text, img } = formState;
      const userMsg: Message = {
         id: userMsgUUID,
         text,
         img,
         sender: "user",
         timestamp: new Date(),
      };

      // generate pending AI message
      const pendingAiMsg: Message = {
         id: aiMsgUUID,
         text: "",
         sender: "ai",
         status: "pending",
      };

      // add both to messages array
      setMessagesArr(prev => [...prev, userMsg, pendingAiMsg])

      // reset formState and image previews
      setFormState({ text: "", img: null });
      setImgPreview(null);

      // make the request body in the POST request
      const fd = new FormData();
      // append the text
      fd.append('prompt', formState.text || "NO_TEXT_PROVIDED");
      // append the image file if available
      if (img) fd.append('image', img);
      // append user location data, if available
      if (coords) {
         fd.append('latitude', coords.latitude.toString());
         fd.append('longitude', coords.longitude.toString());
      }
      // append user info
      fd.append('user_id', userId.toString());

      /**
       *  fd will contain the following:
       * - prompt: the TEXT input from the user, if it was empty, it will be "NO_TEXT_PROVIDED"
       * - image: the image file uploaded by the user (if available)
       * - latitude: the user's latitude (if available)
       * - longitude: the user's longitude (if available)
       * - user_id: the user's ID from the database
       */

      try {

         console.log(`User ${userEmail} attempting to send a new query with text "${text}" and ${img ? img.name : "no image"}`);
         if (coords) console.log(`User is at latitude ${coords.latitude.toString()} and longitude ${coords.longitude.toString()}`)

         // send HTTP POST request
         const res = await axios.post(`${SERVER_API_URL}/api/query`, fd,
            {
               maxContentLength: 100 * 1024 * 1024,
               maxBodyLength: 100 * 1024 * 1024,
               headers: { 'Content-Type': 'multipart/form-data' },
               withCredentials: true,
            }
         )

         // extract res data (this format might change later)
         const { reply, confidence } = res.data as { reply: string, confidence: number };

         console.log(`Server replied to ${userEmail} querying "${text}" with "${reply}" that has confidence ${confidence}`);

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

         console.log(`Server replied to ${userEmail} querying "${text}" with an error: \n${error}`);

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

   // handle single img upload or removal
   function handleFormImgChange(param: File | null) {

      if (param instanceof File) {
         // case: add file
      
         const isImgFile = param.type.startsWith("image/");
   
         if (!isImgFile) {
            toast.error("Please upload only image files");
            return;
         }
   
         if (formState.img) {
            toast.error("Please upload only one image file at a time");
            return;
         }
   
         setFormState((pv) => ({ ...pv, img: param }));
   
         // Create preview URLs
         const reader = new FileReader();
         reader.onloadend = () => {
            setImgPreview(reader.result as string);
         };
         reader.readAsDataURL(param);

      } else {
         // case: remove file

         setFormState((pv) => ({ ...pv, img: null }));
         setImgPreview(null);

      }

   }

   // handle formState text change
   function handleFormTextChange(newText: string) {
      setFormState((pv) => ({ ...pv, text: newText }));
   }

   return (
      <div className="h-full flex flex-col">

         <div className="flex-1 overflow-y-auto">
            <MessagesDisplay messagesArr={messagesArr} />
         </div>

         <div className="sticky bottom-0">

            <ChatbotForm
               handleSubmitForm={handleSubmitForm}
               handleFormImgChange={handleFormImgChange}
               handleFormTextChange={handleFormTextChange}
               imgPreview={imgPreview}
               formState={formState}
               isWaitingForRes={isWaitingForRes}
            />

            <div className="text-xs m-2 text-center text-gray-500">
               {!coords && 
                  <div className="font-bold flex flex-row items-center justify-center gap-1">
                     <Info size={15} strokeWidth="3"/>This chatbot requires your location data for personalised recommendations.
                  </div>
               }
               <div>AI-generated, for reference only.</div>
            </div>

         </div>

      </div>
   );
}
