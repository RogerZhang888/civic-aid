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
   | { type: "DELETE_QUERY"; payload: { chatId: string, queryId: string } }
   | { type: "UPDATE_QUERY_WITH_REPLY_AND_SOURCES_AND_MAYBE_UPDATE_CHAT_TITLE_WHAT_THE_FUCK"; payload: { answer: string, sources?: string[], title?: string, chatId: string, queryId: string } }
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
         return [action.payload, ...state];

      case "UPDATE_CHAT_WITH_NEW_QUERY":
         return state.map(chat => 
            chat.id === action.payload.chatId
               ?  { ...chat, queries: [...chat.queries, action.payload.newQuery] }
               :  chat
         );
      
      case "UPDATE_QUERY_WITH_REPLY_AND_SOURCES_AND_MAYBE_UPDATE_CHAT_TITLE_WHAT_THE_FUCK":
         return state.map(chat => 
            chat.id === action.payload.chatId
               ?  {
                  ...chat,
                  ...(action.payload.title ? { title: action.payload.title } : {}),
                  queries: chat.queries.map(query => 
                     query.id === action.payload.queryId
                        ?  { ...query, answer: action.payload.answer, status: "finished", sources: action.payload.sources || [] }
                        :  query
                  )
               }
               :  chat
         );
      
      case "DELETE_QUERY":
         return state.map(chat => 
            chat.id === action.payload.chatId
               ?  {
                  ...chat,
                  queries: chat.queries.filter(q => q.id !== action.payload.queryId)
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

export default function ChatProvider({ children, currChatId, }: { children: React.ReactNode; currChatId: string | undefined; }) {

   const [chats, chatsDispatch] = useReducer(chatReducer, []);

   const [formState, setFormState] = useState<FormState>({ text: "", img: null });
   const [imgPreview, setImgPreview] = useState<string | null>(null);
   const [isWaiting, setIsWaiting] = useState<boolean>(false);
   const [isFetchingAChat, setIsFetchingAChat] = useState<boolean>(false);

   const navigate = useNavigate();

   useEffect(() => {

      async function fetchAllChats() {
         console.log("fetching all of user's chats...");
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
         console.log(`${formattedChats.length} chats fetched`);
         chatsDispatch({ type: "GET_ALL_CHATS", payload: formattedChats });
         return formattedChats;
      }

      async function fetchQueriesForThisChat() {
         setIsFetchingAChat(true);
         console.log(`fetching chat ${currChatId}...`);
         try {
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
               sources: string[]
            }[];
            const formattedQueries = queries.map<Query>(query => ({
               id: query.id,
               question: query.user_prompt,
               img: null,
               answer: query.response,
               status: "finished",
               timestamp: new Date(query.created_at),
               sources: query.sources
            }));
            console.log(`${formattedQueries.length} queries fetched`);
            chatsDispatch({ type: "UPDATE_ALL_QUERIES_OF_CHAT", payload: { chatId: currChatId!, queries: formattedQueries } });

         } catch (error) {
            if (axios.isAxiosError(error)) {
               if (error.response?.status === 404) {
                  console.log(`No queries found for chat id ${currChatId}: Deleted chat`);
                  chatsDispatch({ type: "DELETE_CHAT", payload: { chatId: currChatId! } });
                  toast.error("There was no history found for your chat.");
                  navigate("/chatbot");
               } else {
                  console.log(error);
                  toast.error(error.response?.data.error);
               }
            } else {
               console.log(error);
               toast.error("An unknown error occured while fetching your chat history. Please refresh the page to try again.");
            }

         } finally {
            setIsFetchingAChat(false);
         }
      }

      if (chats.length === 0) {
         fetchAllChats().then(() => {
            if (currChatId) fetchQueriesForThisChat();
         })
      } else if (currChatId && chats.find(chat => chat.id === currChatId)?.queries.length === 0) {
         fetchQueriesForThisChat()
      }

   }, [currChatId, chats, navigate])

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
   
      const chatId = currChatId || await handleCreateNewChat();

      if (!chatId) throw new Error("Failed to create chat");

      await handleAddQueryToExistingChat(chatId);

      setIsWaiting(false);
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
         sources: []
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
     
      fd.append('chatId', chatIdToAddQueryTo);


      /**
       *  fd will contain the following:
       * - prompt: the TEXT input from the user, if it was empty, it will be "NO TEXT PROVIDED"
       * - image: the image file uploaded by the user (if available)
       * - latitude: the user's latitude (if available)
       * - longitude: the user's longitude (if available)
       * - chatid: the chat ID
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

         const { answer, sources, title } = res.data as { answer: string, sources?: string[], title?: string };

         console.log(`Server replied with "${answer}"`);

         chatsDispatch({ type: "UPDATE_QUERY_WITH_REPLY_AND_SOURCES_AND_MAYBE_UPDATE_CHAT_TITLE_WHAT_THE_FUCK", payload: { answer, sources, chatId: chatIdToAddQueryTo, queryId: newQueryUUID, title } });

         navigate(`/chatbot/${chatIdToAddQueryTo}`);

      } catch (error) {

         setFormState({ text, img });

         console.log(`Server replied with an error: \n${error}`);

         if (axios.isAxiosError(error)) {

            toast.error(error.message);

            chatsDispatch({ type: "DELETE_QUERY", payload: { chatId: chatIdToAddQueryTo, queryId: newQueryUUID } });

         } else {

            toast.error("Sorry, a reply could not be generated. Please try again.")

            chatsDispatch({ type: "DELETE_QUERY", payload: { chatId: chatIdToAddQueryTo, queryId: newQueryUUID } });
   
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
         isWaiting,
         isFetchingAChat
      }}>
         {children}
      </ChatContext.Provider>
   )
}