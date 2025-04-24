import { AnimatePresence, motion } from "framer-motion";
import {
   MessageSquarePlus,
   PanelRightClose,
   PanelRightOpen,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import useTranslation from "../language/useTranslation";
import ChatsButtonColumn from "./ChatButtonsColumn";

export default function ChatSidebar() {
   const [isExpanded, setIsExpanded] = useState(false);
   const navigate = useNavigate();
   const { t } = useTranslation();

   return (
      <motion.div
         className="bg-primary flex flex-col py-4 px-2 space-y-4"
         animate={{ width: isExpanded ? "16rem" : "4rem" }}
         transition={{ ease: "easeInOut" }}
      >
         <AnimatePresence mode="popLayout">
            {isExpanded ? (
               <motion.div
                  key="expanded-controls"
                  className="flex items-center justify-between"
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
                     className="flex items-center space-x-1 btn max-w-45"
                     onClick={() => navigate("/chatbot")}
                  >
                     <MessageSquarePlus size={25} />
                     <span className="text-sm">{t('newChat')}</span>
                  </button>
                  <button
                     className="btn btn-square btn-sm"
                     onClick={() => setIsExpanded(false)}
                  >
                     <PanelRightOpen size={25} />
                  </button>
               </motion.div>
            ) : (
               <motion.div
                  key="collapsed-controls"
                  className="flex flex-col items-center gap-4"
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
                     <PanelRightClose size={25} />
                  </button>
                  <button
                     className="btn btn-square btn-sm"
                     onClick={() => navigate("/chatbot")}
                  >
                     <MessageSquarePlus size={25} />
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
                  className="flex flex-col overflow-y-auto space-y-3"
               >
                  <ChatsButtonColumn />
               </motion.div>
            )}
         </AnimatePresence>
      </motion.div>
   );
}