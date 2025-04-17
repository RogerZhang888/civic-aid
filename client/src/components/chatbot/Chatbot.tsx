import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useGeolocated } from "react-geolocated";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import { Info } from "lucide-react";

import useUser from "../auth/useUser";
import ChatbotForm from "./ChatbotForm";
import { Chat, FormState, Message } from "../types";
import MessagesDisplay from "./MessagesDisplay";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function Chatbot({ 
   currChatId,
   chats,
   handleStartNewChat,
   handleUpdateChat
}: { 
   currChatId: string | undefined
   chats: Chat[]
   handleStartNewChat: (x: string, y: Message, z: string) => void
   handleUpdateChat: (x: string, y: Message) => void
}) {

   const isNewChat = !currChatId;
   const currChat = chats.find(chat => chat.id === currChatId) || null;

   const [messages, setMessages] = useState<Message[]>([]);
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

   const { data: user } = useUser();

   // useEffect(() => {
   //    setMessages([
   //       {
   //          id: uuidv4(),
   //          text: `Hello! I'm Civic-AId. This is chat ${chatId}.`,
   //          sender: "ai",
   //          timestamp: new Date(),
   //          status: "finished"
   //       }
   //    ]);
   // }, [chatId]);

   const { id: userId, email: userEmail } = user!;

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
      setMessages(prev => [...prev, userMsg, pendingAiMsg])

      // reset formState and image previews
      setFormState({ text: "", img: null });
      setImgPreview(null);

      // make the request body in the POST request
      const fd = new FormData();
      // append the text
      fd.append('prompt', formState.text || "NO TEXT PROVIDED");
      // append the image file if available
      if (img) fd.append('image', img);
      // append user location data, if available
      if (coords) {
         fd.append('latitude', coords.latitude.toString());
         fd.append('longitude', coords.longitude.toString());
      }
      // if chatId is available, append it too, if not "NEW CHAT"
      fd.append('chat_id', currChatId || "NEW CHAT");

      /**
       *  fd will contain the following:
       * - prompt: the TEXT input from the user, if it was empty, it will be "NO TEXT PROVIDED"
       * - image: the image file uploaded by the user (if available)
       * - latitude: the user's latitude (if available)
       * - longitude: the user's longitude (if available)
       * - chat_id: the chat ID from the URL, if not available, it will be "NEW CHAT"
       */

      console.log(fd);

      try {

         // send HTTP POST request
         const res = await axios.post(`${SERVER_API_URL}/api/uery`, fd,
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

         setMessages(prev => prev.map(msg => 
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

            setMessages(prev => prev.map(msg => 
               msg.id === pendingAiMsg.id 
               ?  { ...msg, text: error.message, status: "finished", timestamp: new Date() }
               :  msg
            ));
   
            console.error("Request error during submission:", error.message);

         } else {

            setMessages(prev => prev.map(msg => 
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
   function setImage(param: File | null) {

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
   function setText(newText: string) {
      setFormState((pv) => ({ ...pv, text: newText }));
   }

   if (isNewChat) {
      return (
         <div className="h-full flex flex-1 flex-col">
            {/* Main content - centered */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-3">
               <div className="flex flex-row items-center space-x-3">
                  <img
                     src="../../../public/DeepSeek.png"
                     alt="logo"
                     className="w-15"
                  />
                  <div className="text-2xl">
                     Your AI assistant for civic engagement!
                  </div>
               </div>
               <div>
                  How can I help you today?
               </div>
               <ChatbotForm
                  handleSubmitForm={handleSubmitForm}
                  setImage={setImage}
                  setText={setText}
                  imgPreview={imgPreview}
                  formState={formState}
                  isWaitingForRes={isWaitingForRes}
               />
            </div>
         
            {/* Footer - sticky bottom */}
            <div className="sticky bottom-0 bg-white"> {/* Added bg-white to ensure visibility */}
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
      )
   }

   return (
      <div className="h-full flex flex-1 flex-col">

         <div className="flex-1 overflow-y-auto">
            <MessagesDisplay messages={messages} />
         </div>

         <div className="sticky bottom-0">

            <ChatbotForm
               handleSubmitForm={handleSubmitForm}
               setImage={setImage}
               setText={setText}
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
