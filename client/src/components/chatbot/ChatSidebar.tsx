import { AnimatePresence, motion } from "framer-motion";
import {
   ChevronLeft,
   ChevronRight,
   Edit3,
   MessageSquare,
   MoreHorizontal,
   Plus,
   Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useChatContext } from "./ChatContext";

export default function ChatSidebar() {
   const [isExpanded, setIsExpanded] = useState(false);
   const navigate = useNavigate();

   return (
      <motion.div
         className="bg-primary text-primary-content flex flex-col overflow-hidden"
         animate={{ width: isExpanded ? "16rem" : "4rem" }}
         transition={{ ease: "easeInOut" }}
      >
         <AnimatePresence mode="popLayout">
            {isExpanded ? (
               <motion.div
                  key="expanded-controls"
                  className="flex items-center justify-between p-2"
                  initial={{ opacity: 0, x: -150 }}
                  animate={{
                     opacity: 1,
                     x: 0,
                     transition: { ease: "easeInOut" },
                  }}
                  exit={{
                     opacity: 0,
                     x: -150,
                     transition: { ease: "easeInOut" },
                  }}
               >

                  <button 
                     className="flex bg-primary-content border-primary-content items-center space-x-1 btn btn-info hover:bg-primary-content/90 border-primary-content/90"
                     onClick={() => navigate("/chatbot")}
                  >
                     <Plus size={25} />
                     <span className="text-xs">New chat</span>
                  </button>
                  <button
                     className="btn btn-square btn-sm"
                     onClick={() => setIsExpanded(false)}
                  >
                     <ChevronLeft size={25} />
                  </button>
               </motion.div>
            ) : (
               <motion.div
                  key="collapsed-controls"
                  className="flex flex-col items-center gap-4 p-2"
                  initial={{ opacity: 0, x: 150 }}
                  animate={{
                     opacity: 1,
                     x: 0,
                     transition: { ease: "easeInOut" },
                  }}
                  exit={{
                     opacity: 0,
                     x: 150,
                     transition: { ease: "easeInOut" },
                  }}
               >
                  <button
                     className="btn btn-square btn-sm"
                     onClick={() => setIsExpanded(true)}
                  >
                     <ChevronRight size={25} />
                  </button>
                  <button
                     className="btn btn-square btn-sm"
                     onClick={() => navigate("/chatbot")}
                  >
                     <MessageSquare size={25} />
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

         <AnimatePresence mode="popLayout">
            {isExpanded && (
               <motion.div
                  initial={{ opacity: 0, x: -500 }}
                  animate={{
                     opacity: 1,
                     x: 0,
                     transition: { ease: "easeInOut" },
                  }}
                  exit={{
                     opacity: 0,
                     x: -500,
                     transition: { ease: "easeInOut" },
                  }}
                  className="p-2 flex-1 flex flex-col overflow-hidden"
               >
                  <ChatsButtonColumn />
               </motion.div>
            )}
         </AnimatePresence>
      </motion.div>
   );
}

function ChatsButtonColumn() {
   const { chats, currChatId, deleteChat } = useChatContext();
   const navigate = useNavigate();
   const [openMenuId, setOpenMenuId] = useState<string | null>(null);

   // Close menu when clicking elsewhere
   useEffect(() => {
      const handleClickOutside = () => setOpenMenuId(null);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
   }, []);

   return (
      <div className="flex-1 overflow-y-auto space-y-3">
         {chats.length > 0 ? (
            chats.map((chat) => (
               <div
                  key={chat.id}
                  className="flex relative group"
               >
                  <button
                     className={`w-full btn btn-outline btn-info ${
                        currChatId === chat.id ? "btn-active" : ""
                     }`}
                     onClick={() => navigate(`/chatbot/${chat.id}`)}
                  >
                     {chat.title}
                  </button>

                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                     }}
                     className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-black p-1 transition duration-300 ease-in-out
                     hover:cursor-pointer hover:bg-gray-600 hover:text-white opacity-0 group-hover:opacity-100"
                  >
                     <MoreHorizontal size={15} />
                  </button>

                  {openMenuId === chat.id && (
                     <div
                        className="absolute right-0 ml-2 z-50 join join-vertical bg-base-100"
                        onClick={(e) => e.stopPropagation()}
                     >
                        <button className="btn join-item">
                           <Edit3 size={14} className="mr-2" />
                           Rename
                        </button>
                        <button
                           className="btn btn-error join-item"
                           onClick={() => deleteChat(chat.id)}
                        >
                           <Trash2 size={14} className="mr-2" />
                           Delete
                        </button>
                     </div>
                  )}
               </div>
            ))
         ) : (
            <div className="text-center text-sm italic">Start a new chat!</div>
         )}
      </div>
   );
}
