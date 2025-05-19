import { useGeolocated } from "react-geolocated";
import { ChatContext } from "./ChatContext";
import { useCallback, useEffect, useReducer, useState } from "react";
import { Chat, FormState, GetChatRes, GetQueriesForChatRes, Query } from "../types";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router";
import chatReducer from "./chatReducer";
import { BookMarked } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import useUser from "../../hooks/useUser";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function ChatProvider({ children }: { children: React.ReactNode }) {

   const [chats, chatsDispatch] = useReducer(chatReducer, []);
   const [areChatsFetchedInitially, setAreChatsFetchedInitially] = useState<boolean>(false);

   const [formState, setFormState] = useState<FormState>({ text: "", img: null });
   const [imgPreview, setImgPreview] = useState<string | null>(null);
   const [isWaiting, setIsWaiting] = useState<boolean>(false);
   const [isFetchingAChat, setIsFetchingAChat] = useState<boolean>(false);

   const queryClient = useQueryClient();

   const navigate = useNavigate();

   const { data: user } = useUser();

   const currUrl = useLocation();

   const currChatId = currUrl.pathname.includes("/chatbot/") ? currUrl.pathname.split("/").at(-1) : "";

   const ReportJSX = useCallback((id: string, agency: string) => {
      return (
         <div id="answer-for-report-chat" className="space-y-2">
            <div className="text-xl font-semibold">Your Report Has Been Created!</div>
            <p>
               Thank you for being an active citizen! Your report will be sent to {agency} for them to take a look. I'll keep you posted on whether this issue has been resolved!
            </p>
            <button 
               className="btn flex flex-row justify-center items-center px-5"
               onClick={async () => {
                  await queryClient.invalidateQueries({ queryKey: ['current-user-reports']});
                  navigate(`/profile/${id}`)
               }}
            >
               <BookMarked/> View your report
            </button>
         </div>
      )
   }, [navigate, queryClient])

   function fetchAllChats() {
      console.log("fetching all of user's chats...");
      return axios.get(
         `${SERVER_API_URL}/api/chats`,
         { withCredentials: true }
      )
      .then(res => {
         const rawChats = res.data as GetChatRes[];
         const formattedChats = rawChats.map<Chat>(rc => ({
            id: rc.id,
            title: rc.title,
            type: rc.type,
            createdAt: new Date(rc.created_at),
            queries: [],
         }));
         console.log(`${formattedChats.length} chats fetched for user`);
         chatsDispatch({ type: "GET_ALL_CHATS", payload: formattedChats });
         return formattedChats;
      })
      .catch(() => {
         toast.error("An error occured while trying to fetch your chats.");
         return [];
      })
   }

   const fetchQueriesForThisChat = useCallback((chatIdToFetch: string) => {
      setIsFetchingAChat(true);
      console.log(`fetching chat ${chatIdToFetch}...`);

      axios.get(
         `${SERVER_API_URL}/api/chats/${chatIdToFetch}`,
         { withCredentials: true }
      )
      .then(res => {
         const rawQueries = res.data as GetQueriesForChatRes[];

         const formattedQueries = rawQueries.map<Query>(rq => {
            if ('summary' in rq) {
               return {
                  question: rq.prompt,
                  media: rq.media || null,
                  answer: ReportJSX(rq.reportId, rq.agency),
                  timestamp: new Date(rq.timestamp),
                  status: "finished",
                  sources: rq.sources
               };
            } else {
               return {
                  question: rq.prompt,
                  media: rq.media || null,
                  answer: rq.answer,
                  timestamp: new Date(rq.timestamp),
                  status: "finished",
                  sources: rq.sources
               }
            }
         });

         console.log(`${formattedQueries.length} queries fetched for chat ${chatIdToFetch}`);
         chatsDispatch({ type: "UPDATE_ALL_QUERIES_OF_CHAT", payload: { chatId: chatIdToFetch!, queries: formattedQueries } });
      })
      .catch(error => {
         if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
               console.log(`No queries were found for chat id ${chatIdToFetch}.`);
               chatsDispatch({ type: "DELETE_CHAT", payload: { chatId: chatIdToFetch! } });
               toast.error(`No queries were found for chat id ${chatIdToFetch}.`);
               navigate("/chatbot");
            } else {
               console.log(error);
               toast.error(error.response?.data.error);
            }
         } else {
            console.log(error);
            toast.error(`An error occured while fetching chat ${chatIdToFetch}'s history.`);
         }
      })
      .finally(() => {               
         setIsFetchingAChat(false);
      })

   }, [ReportJSX, navigate])

   useEffect(() => {

      if (!user) {
         if (chats.length !== 0) chatsDispatch({ type: "DELETE_ALL_CHATS", payload: null });
         setAreChatsFetchedInitially(false);
         return;
      }

      if (chats.length === 0 && !areChatsFetchedInitially) {
         fetchAllChats().then(() => {
            setAreChatsFetchedInitially(true);
            if (currChatId) fetchQueriesForThisChat(currChatId);
         })
      } else if (currChatId && chats.find(chat => chat.id === currChatId)?.queries.length === 0) {
         fetchQueriesForThisChat(currChatId)
      }

   }, [currChatId, chats, navigate, areChatsFetchedInitially, ReportJSX, fetchQueriesForThisChat, user]);

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

      const { text, img } = formState;

      const newQuery: Query = {
         question: text,
         media: img ? "pending actual image url..." : null,
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
               reportId,
               agency,
               media
            } = res.data as { 
               summary: string, 
               title: string,
               sources: string[],
               reportId: string,
               agency: string,
               media?: string
            }

            console.log(`Server successfully created a report: "${summary}"`);

            toast.success("Your report was successfully created!")
   
            chatsDispatch({ type: "UPDATE_QUERY_ANS_SOURCES_TITLE_MEDIA", payload: { chatId: chatIdToAddQueryTo, answer: ReportJSX(reportId, agency), sources, title, media } });

         } else {

            // case: normal response

            const { answer, sources, title, media } = res.data as { answer: string, sources: string[], title: string, media?: string };
   
            console.log(`Server replied with "${answer}"`);
   
            chatsDispatch({ type: "UPDATE_QUERY_ANS_SOURCES_TITLE_MEDIA", payload: { chatId: chatIdToAddQueryTo, answer, sources, title, media } });
   
         }

      } catch (error) {

         setFormState({ text, img });

         console.log(`Server replied with an error: \n${error}`);

         if (axios.isAxiosError(error)) {

            toast.error(error.message);

            chatsDispatch({ type: "DELETE_QUERY", payload: { chatId: chatIdToAddQueryTo } });

         } else {

            toast.error("Sorry, a reply could not be generated. Please try again.")

            chatsDispatch({ type: "DELETE_QUERY", payload: { chatId: chatIdToAddQueryTo } });
   
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