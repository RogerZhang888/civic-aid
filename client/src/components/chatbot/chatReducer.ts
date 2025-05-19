import { Chat, Query } from "../types";

type Action = 
   | { type: "GET_ALL_CHATS"; payload: Chat[] }
   | { type: "UPDATE_ALL_QUERIES_OF_CHAT"; payload: { chatId: string, queries: Query[] } }
   | { type: "ADD_NEW_CHAT"; payload: Chat }
   | { type: "UPDATE_CHAT_WITH_NEW_QUERY"; payload: { newQuery: Query, chatId: string } }
   | { type: "DELETE_QUERY"; payload: { chatId: string } }
   | { type: "UPDATE_QUERY_ANS_SOURCES_TITLE_MEDIA"; payload: { answer: string | React.ReactNode, sources: string[], media?: string, title: string, chatId: string } }
   | { type: "DELETE_CHAT"; payload: { chatId: string } }
   | { type: "UPDATE_CHAT_TITLE"; payload: { chatId: string, newTitle: string } }
   | { type: "DELETE_ALL_CHATS"; payload: null };

export default function chatReducer(state: Chat[], action: Action): Chat[] {
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
      
      case "UPDATE_QUERY_ANS_SOURCES_TITLE_MEDIA":
         return state.map(chat => 
            chat.id === action.payload.chatId
               ?  {
                  ...chat,
                  title: action.payload.title,
                  queries: chat.queries.map((query, idx) => 
                     idx === chat.queries.length - 1
                        ?  { 
                              ...query,
                              answer: action.payload.answer,
                              status: "finished",
                              sources: action.payload.sources || [],
                              media: action.payload.media || null
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
                  queries: chat.queries.slice(0, chat.queries.length - 1)
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
      
      case "DELETE_ALL_CHATS":
         return [];

      default:
         throw new Error('Unknown action');

   }
}