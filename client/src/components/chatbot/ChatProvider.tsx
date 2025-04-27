import { useGeolocated } from "react-geolocated";
import { ChatContext } from "./ChatContext";
import { useEffect, useReducer, useState } from "react";
import { Chat, FormState, Query } from "../types";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router";

type Action = 
   | { type: "GET_ALL_CHATS"; payload: Chat[] }
   | { type: "UPDATE_ALL_QUERIES_OF_CHAT"; payload: { chatId: string, queries: Query[] } }
   | { type: "ADD_NEW_CHAT"; payload: Chat }
   | { type: "UPDATE_CHAT_WITH_NEW_QUERY"; payload: { newQuery: Query, chatId: string } }
   | { type: "DELETE_QUERY"; payload: { chatId: string, queryId: string } }
   | { type: "UPDATE_QUERY_ANS_SOURCES_TITLE_IMGURL"; payload: { answer: string | React.ReactNode, sources?: string[], media?: string, title: string, chatId: string, queryId: string } }
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
      
      case "UPDATE_QUERY_ANS_SOURCES_TITLE_IMGURL":
         return state.map(chat => 
            chat.id === action.payload.chatId
               ?  {
                  ...chat,
                  title: action.payload.title,
                  queries: chat.queries.map(query => 
                     query.id === action.payload.queryId
                        ?  { 
                              ...query,
                              answer: action.payload.answer,
                              status: "finished",
                              sources: action.payload.sources || [],
                              imgUrl: action.payload.media || null
                           }
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
   const [areChatsFetchedInitially, setAreChatsFetchedInitially] = useState<boolean>(false);

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
         console.log(`${formattedChats.length} chats fetched for user`);
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
               media_url: string[],
               created_at: string,
               sources: string[]
            }[];
            const formattedQueries = queries.map<Query>(query => ({
               id: query.id,
               question: query.user_prompt,
               imgUrl: query.media_url.length > 0 ? query.media_url[0]: null,
               answer: query.response,
               status: "finished",
               timestamp: new Date(query.created_at),
               sources: query.sources
            }));
            console.log(`${formattedQueries.length} queries fetched for chat ${currChatId}`);
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

      if (chats.length === 0 && !areChatsFetchedInitially) {
         fetchAllChats().then(() => {
            setAreChatsFetchedInitially(true);
            if (currChatId) fetchQueriesForThisChat();
         })
      } else if (currChatId && chats.find(chat => chat.id === currChatId)?.queries.length === 0) {
         fetchQueriesForThisChat()
      }

   }, [currChatId, chats, navigate, areChatsFetchedInitially])

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

      if (!chatId) throw new Error("Unable to add query as no chat ID exists")

      await handleAddQueryToExistingChat(chatId);

      setIsWaiting(false);
   }
   
   async function handleCreateNewChat() {

      console.log("Creating new chat");

      const newChatUUID = uuidv4();

      const newChat: Chat = {
         id: newChatUUID,
         title: "New Chat",
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
         navigate(`/chatbot/${newChatUUID}`);

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
         imgUrl: img ? "pending actual image url..." : null,
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
      fd.append('prompt', text || "");
      if (img) fd.append('image', img);
      if (coords) {
         fd.append('latitude', coords.latitude.toString());
         fd.append('longitude', coords.longitude.toString());
      }
     
      fd.append('chatId', chatIdToAddQueryTo);


      /**
       *  fd will contain the following:
       * - prompt: the TEXT input from the user, if it was empty, it will be "" (empty string)
       * - image: the image file uploaded by the user (if available)
       * - latitude: the user's latitude (if available)
       * - longitude: the user's longitude (if available)
       * - chatid: the chat ID
       */

      console.log(`New query for chat if ${chatIdToAddQueryTo}:`);
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

         console.log(res)

         if (res.data.summary) {

            // case: report created

            const {
               summary,
               title,
               sources,
               media: newMediaUrl
            } = res.data as { 
               summary: string, 
               urgency: number, 
               recommendedSteps: string, 
               agency: string,
               title: string,
               sources?: string[],
               valid: boolean,
               media?: string
            }

            console.log(`Server successfully created a report: "${summary}"`);

            const reportAnswerComponent = (
               <div id="answer-for-report-chat" className="space-y-2">
                  <div className="text-xl font-semibold">Your Report Has Been Created!</div>
                  <div>Title: {title}</div>
                  <div>Summary: {summary}</div>
                  <div>View more details <Link to={`/profile/${"TODO"}`}></Link></div>
               </div>
            )
   
            chatsDispatch({ type: "UPDATE_QUERY_ANS_SOURCES_TITLE_IMGURL", payload: { chatId: chatIdToAddQueryTo, queryId: newQueryUUID, answer: reportAnswerComponent, sources, title, media: newMediaUrl } });

         } else {

            // case: normal response

            const { answer, sources, title, media } = res.data as { answer: string, sources?: string[], title: string, media?: string };
   
            console.log(`Server replied with "${answer}"`);
   
            chatsDispatch({ type: "UPDATE_QUERY_ANS_SOURCES_TITLE_IMGURL", payload: { chatId: chatIdToAddQueryTo, queryId: newQueryUUID, answer, sources, title, media } });
   
         }

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

   // async function fetchAllImgs(imgUrls: string[]) {

   //    const promises = imgUrls.map(url => axios.get(`${SERVER_API_URL}/api/images/${url}`, { withCredentials: true }));

   //    const resArr = await Promise.all(promises);

   //    return resArr.map(res => res.data) as string[];

   // }

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