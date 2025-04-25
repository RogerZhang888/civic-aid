import { useNavigate } from "react-router-dom";
import { useChatContext } from "./ChatContext";
import { useEffect, useState } from "react";
import { Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatsButtonColumn() {
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

   if (chats.length === 0) return <div className="text-center text-sm font-semibold">No chats yet. Start chatting!</div>;

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
                  className={`btn w-full btn-outline btn-secondary text-white text-nowrap overflow-hidden flex justify-start items-center ${
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
