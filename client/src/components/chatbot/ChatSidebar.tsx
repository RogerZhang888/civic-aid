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
                     className="flex bg-primary-content border-primary-content items-center space-x-1 btn btn-info hover:bg-primary-content/90"
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
                  <div className="flex-1 overflow-y-auto space-y-3">
                     <ChatsButtonColumn />
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </motion.div>
   );
}

function ChatsButtonColumn() {
   const { chats, currChatId, deleteChat, renameChat } = useChatContext();
   const navigate = useNavigate();
   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
   const [editingChatId, setEditingChatId] = useState<string | null>(null);
   const [editedTitle, setEditedTitle] = useState("");

   // Close menu when clicking elsewhere
   useEffect(() => {
      const handleClickOutside = () => {
         setOpenMenuId(null);
         setEditingChatId(null);
         setEditedTitle("");
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
   }, [editingChatId, editedTitle]);

   const handleRenameClick = (chatId: string, currentTitle: string) => {
      setEditingChatId(chatId);
      setEditedTitle(currentTitle);
      setOpenMenuId(null);
   };

   const handleSaveEdit = () => {
      // check if: editingChatId is not null, editedTitle is not empty, and the title is DIFFERENT from the current title
      if (editingChatId && editedTitle.trim() && chats.find(c => c.id === editingChatId)!.title !== editedTitle) {
         renameChat(editingChatId, editedTitle)
            .finally(() => {
               setEditedTitle("");
               setEditingChatId(null);
            });
      }
   };

   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
         handleSaveEdit();
      } else if (e.key === "Escape") {
         setEditingChatId(null);
      }
   };

   if (chats.length === 0) return <div className="text-center text-sm italic">Start a new chat!</div>;

   return chats.map(thisChat =>
      <div key={thisChat.id} className="flex relative group">

         {editingChatId === thisChat.id 
            ?  <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full input input-ghost border-0 bg-secondary"
                  autoFocus
               />
            :  <button
                  className={`w-full btn btn-outline btn-secondary text-white text-nowrap overflow-hidden flex justify-start items-center ${
                     currChatId === thisChat.id ? "btn-active" : ""
                  }`}
                  onClick={() => navigate(`/chatbot/${thisChat.id}`)}
               >
                  {thisChat.title.slice(0, 25) + (thisChat.title.length > 25 ? "..." : "")}
               </button>
         }

         {editingChatId !== thisChat.id &&
            <button
               onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(
                     openMenuId === thisChat.id ? null : thisChat.id
                  );
               }}
               className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-black p-1 transition duration-300 ease-in-out
               hover:cursor-pointer hover:bg-white opacity-0 group-hover:opacity-100"
            >
               <MoreHorizontal size={15} />
            </button>
         }

         {openMenuId === thisChat.id &&
            <motion.div
               initial={{ opacity: 0 }}
               animate={{
                  opacity: 1,
                  transition: { ease: "easeInOut" },
               }}
               exit={{
                  opacity: 0,
                  transition: { ease: "easeInOut" },
               }}
               className="absolute right-0 top-full ml-2 mt-2 z-50 join join-vertical"
               onClick={(e) => e.stopPropagation()}
            >
               <button
                  className="btn join-item"
                  onClick={() => {
                     setOpenMenuId(null);
                     handleRenameClick(thisChat.id, thisChat.title)
                  }}
               >
                  <Edit3 size={14} className="mr-2" />
                  Rename
               </button>
               <button
                  className="btn btn-secondary join-item"
                  onClick={() => deleteChat(thisChat.id)}
               >
                  <Trash2 size={14} className="mr-2" />
                  Delete
               </button>
            </motion.div>
         }

      </div>
   );
}
