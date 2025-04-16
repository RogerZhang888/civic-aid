import { Outlet, useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Plus } from "lucide-react";

export default function ChatbotWrapper() {
   const { chatId } = useParams<{ chatId: string }>();

   return (
      <div className="flex flex-row h-full">
         <Sidebar currChatId={chatId}/>
         <Outlet />
      </div>
   );
}

function Sidebar(
   { currChatId }: { currChatId: string | undefined }
) {
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
                  <button className="flex items-center space-x-1 btn btn-info">
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
                     {[1, 2, 3, 4, 5].map(i => (
                        <button
                           key={i}
                           className={`btn btn-info btn-outline text-left ${currChatId === `${i}` ? "btn-active" : ""}`}
                           onClick={() => navigate(`/chatbot/${i}`)}
                        >
                           Chat {i}
                        </button>
                     ))}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </motion.div>
   );
}
