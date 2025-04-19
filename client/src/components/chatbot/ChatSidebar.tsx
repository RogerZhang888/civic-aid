import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquare, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useChatContext } from "./ChatContext";

export default function ChatSidebar() {

   const {
      chats,
      currChatId
   } = useChatContext();

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
                     transition: { ease: "easeInOut"}
                  }}
                  exit={{
                     opacity: 0,
                     x: -150,
                     transition: { ease: "easeInOut"}
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
                     transition: { ease: "easeInOut"}
                  }}
                  exit={{
                     opacity: 0,
                     x: 150,
                     transition: { ease: "easeInOut"}
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
                     transition: { ease: "easeInOut"}
                  }}
                  exit={{
                     opacity: 0,
                     x: -500,
                     transition: { ease: "easeInOut"}
                  }}
                  className="p-2"
               >
                  <div className="flex flex-col space-y-3">
                     {chats.length > 0
                        ? chats.map(chat => (
                              <button
                                 key={chat.id}
                                 className={`btn text-primary-content bg-primary border-primary btn-outline hover:bg-secondary shadow-none btn-info ${currChatId === chat.id ? "btn-active bg-secondary" : "bg-primary"}`}
                                 onClick={() => navigate(`/chatbot/${chat.id}`)}
                              >
                                 {chat.title}
                              </button>
                           ))
                        :  <div className="text-center text-sm">
                              No chats available. Start a new chat!
                           </div>

                     }
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </motion.div>
   );
}
