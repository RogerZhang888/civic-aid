import { useGeolocated } from "react-geolocated";
import { ChatContext } from "./ChatContext";
import { useEffect, useReducer, useState } from "react";
import { Chat, FormState, Query } from "../types";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

type Action = 
   | { type: "GET_ALL_CHATS"; payload: Chat[] }
   | { type: "UPDATE_ALL_QUERIES_OF_CHAT"; payload: { chatId: string, queries: Query[] } }
   | { type: "ADD_NEW_CHAT"; payload: Chat }
   | { type: "UPDATE_CHAT_WITH_NEW_QUERY"; payload: { newQuery: Query, chatId: string } }
   | { type: "UPDATE_QUERY_WITH_ANSWER"; payload: { answer: string, chatId: string, queryId: string } }
   | { type: "DELETE_CHAT"; payload: { chatId: string } }
   | { type: "UPDATE_CHAT_TITLE"; payload: { chatId: string, newTitle: string } };

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

function chatReducer(state: Chat[], action: Action): Chat[] {
   switch (action.type) {

      case "GET_ALL_CHATS":
         return action.payload;
      
      case "UPDATE_ALL_QUERIES_OF_CHAT":
         return state.map(chat => 
            chat.id === action.payload.chatId
               ?  { ...chat, queries: action.payload.queries }
               :  chat
         );

      case "ADD_NEW_CHAT":
         return [...state, action.payload];

      case "UPDATE_CHAT_WITH_NEW_QUERY":
         return state.map(chat => 
            chat.id === action.payload.chatId
               ?  { ...chat, queries: [...chat.queries, action.payload.newQuery] }
               :  chat
         );
      
      case "UPDATE_QUERY_WITH_ANSWER":
         return state.map(chat => 
            chat.id === action.payload.chatId
               ?  {
                  ...chat,
                  queries: chat.queries.map(query => 
                     query.id === action.payload.queryId
                        ?  { ...query, answer: action.payload.answer, status: "finished" }
                        :  query
                  )
               }
               :  chat
         );
         
      case "UPDATE_CHAT_TITLE":
         return state.map(chat =>
            chat.id === action.payload.chatId
               ?  { ...chat, title: action.payload.newTitle }
               :  chat
         );
      
      case "DELETE_CHAT":
         return state.filter(chat => chat.id !== action.payload.chatId);

      default:
         throw new Error('Unknown action');

   }
}

export default function ChatProvider({ 
   children, 
   currChatId, 
}: { 
   children: React.ReactNode; 
   currChatId: string | undefined; 
}) {

   const [formState, setFormState] = useState<FormState>({ text: "", img: null });
   const [imgPreview, setImgPreview] = useState<string | null>(null);
   const [isWaiting, setIsWaiting] = useState<boolean>(false);
   const initChats: Chat[] = [];
   const [chats, chatsDispatch] = useReducer(chatReducer, initChats);

   const navigate = useNavigate();

   useEffect(() => {

      async function fetchAllChats() {
         const res = await axios.get(
            `${SERVER_API_URL}/api/chats`,
            { withCredentials: true }
         );
         const chats = res.data as {
            id: string,
            title: string,
            type: "unknown" | "question" | "report",
            created_at: string,
         }[];
         const formattedChats = chats.map<Chat>(chat => ({
            id: chat.id,
            title: chat.title,
            type: chat.type,
            createdAt: new Date(chat.created_at),
            queries: [],
         }));
         chatsDispatch({ type: "GET_ALL_CHATS", payload: formattedChats });
      }

      fetchAllChats()

   }, []);

   useEffect(() => {

      if (!currChatId) return;

      async function fetchQueriesForThisChat() {
         const res = await axios.get(
            `${SERVER_API_URL}/api/chats/${currChatId}`,
            { withCredentials: true }
         );
         const queries = res.data as {
            id: string,
            user_prompt: string,
            response: string,
            img: null,
            created_at: string,
         }[];
         const formattedQueries = queries.map<Query>(query => ({
            id: query.id,
            question: query.user_prompt,
            img: null,
            answer: query.response,
            status: "finished",
            timestamp: new Date(query.created_at),
         }));
         chatsDispatch({ type: "UPDATE_ALL_QUERIES_OF_CHAT", payload: { chatId: currChatId!, queries: formattedQueries } });
      }

      fetchQueriesForThisChat()

   }, [currChatId])

   // get user's coordinates
   // browser will ask for permission
   // if no permission granted, wont be sent in formdata
   const { coords } = useGeolocated({
      positionOptions: { enableHighAccuracy: false },
      userDecisionTimeout: 5000,
   });

   // handle single img upload or removal
   function updateFormImage(param: File | null) {

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
   function updateFormText(newText: string) {
      setFormState((pv) => ({ ...pv, text: newText }));
   }

   // handle form submission
   async function handleAddQuery() {
      setIsWaiting(true);
   
      try {

         const chatId = currChatId || await handleCreateNewChat();
   
         if (!chatId) throw new Error("Failed to create chat");
   
         await handleAddQueryToExistingChat(chatId);
   
      } catch (error) { 
         console.error("Failed to send query:", error);
         toast.error("Something went wrong while sending your message");
      } finally {
         setIsWaiting(false);
      }
   }
   
   async function handleCreateNewChat() {

      console.log("Creating new chat");

      const newChatUUID = uuidv4();

      const newChat: Chat = {
         id: newChatUUID,
         title: "TITLE " + newChatUUID,
         type: "unknown",
         createdAt: new Date(),
         queries: [],
      };

      try {
         await axios.post(
            `${SERVER_API_URL}/api/chats`, 
            newChat,
            { withCredentials: true }
         )

         chatsDispatch({ type: "ADD_NEW_CHAT", payload: newChat });

         console.log(`New chat ${newChatUUID} created successfully `);

         return newChatUUID;
      } catch (error) {
         toast.error("Error creating new chat");
         console.log(`Server replied with an error: \n${error}`);
      }

   }
   
   async function handleAddQueryToExistingChat(chatIdToAddQueryTo: string) {

      const newQueryUUID = uuidv4();
      const { text, img } = formState;

      const newQuery: Query = {
         id: newQueryUUID,
         question: text,
         img,
         answer: "",
         status: "pending",
         timestamp: new Date(),
      };

      chatsDispatch({ type: "UPDATE_CHAT_WITH_NEW_QUERY", payload: { newQuery, chatId: chatIdToAddQueryTo }});

      // reset formState and image previews
      setFormState({ text: "", img: null });
      setImgPreview(null);

      const fd = new FormData();
      fd.append('prompt', text || "NO TEXT PROVIDED");
      if (img) fd.append('image', img);
      if (coords) {
         fd.append('latitude', coords.latitude.toString());
         fd.append('longitude', coords.longitude.toString());
      }
      fd.append('chat_id', chatIdToAddQueryTo);

      /**
       *  fd will contain the following:
       * - prompt: the TEXT input from the user, if it was empty, it will be "NO TEXT PROVIDED"
       * - image: the image file uploaded by the user (if available)
       * - latitude: the user's latitude (if available)
       * - longitude: the user's longitude (if available)
       * - chat_id: the chat ID
       */

      console.log("FormData to be sent to server:");
      console.log(fd);

      try {

         const res = await axios.post(
            `${SERVER_API_URL}/api/query`, 
            fd,
            {
               maxContentLength: 100 * 1024 * 1024,
               maxBodyLength: 100 * 1024 * 1024,
               headers: { 'Content-Type': 'multipart/form-data' },
               withCredentials: true,
            }
         )

         const { answer } = res.data as { answer: string };

         console.log(`Server replied with "${answer}"`);

         chatsDispatch({ type: "UPDATE_QUERY_WITH_ANSWER", payload: { answer, chatId: chatIdToAddQueryTo, queryId: newQueryUUID } });

         navigate(`/chatbot/${chatIdToAddQueryTo}`);

      } catch (error) {

         console.log(`Server replied with an error: \n${error}`);

         if (axios.isAxiosError(error)) {

            chatsDispatch({ type: "UPDATE_QUERY_WITH_ANSWER", payload: { answer: error.message, chatId: chatIdToAddQueryTo, queryId: newQueryUUID } });

         } else {

            chatsDispatch({ type: "UPDATE_QUERY_WITH_ANSWER", payload: { answer: "An unknown error occurred", chatId: chatIdToAddQueryTo, queryId: newQueryUUID } });
   
         }

      }
   }

   async function deleteChat(chatIdToDelete: string) {
      try {
         await axios.delete(
            `${SERVER_API_URL}/api/chats/${chatIdToDelete}`,
            { withCredentials: true }
         );
         chatsDispatch({ type: "DELETE_CHAT", payload: { chatId: chatIdToDelete } });
         toast.success(`Chat ${chatIdToDelete} deleted successfully`);
         navigate("/chatbot");
      } catch (error) {
         console.error("Failed to delete chat:", error);
         toast.error("Failed to delete chat");
      }
   }

   async function renameChat(chatIdToRename: string, newTitle: string) {
      try {
         await axios.patch(
            `${SERVER_API_URL}/api/chats/${chatIdToRename}`,
            { title: newTitle },
            { withCredentials: true }
         );
         chatsDispatch({ type: "UPDATE_CHAT_TITLE", payload: { chatId: chatIdToRename, newTitle } });
         toast.success(`Chat ${chatIdToRename} renamed successfully`);
      } catch (error) {
         console.error("Failed to rename chat:", error);
         toast.error("Failed to rename chat");
      }
   }

   return (
      <ChatContext.Provider value={{ 
         handleAddQuery,
         updateFormImage,
         updateFormText,
         deleteChat,
         renameChat,
         chats,
         formState,
         imgPreview,
         currChatId,
         coords,
         isWaiting
      }}>
         {children}
      </ChatContext.Provider>
   )
}