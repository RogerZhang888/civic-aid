import { MessageCircle, Trash2, Edit } from 'lucide-react';
import clsx from 'clsx';

interface CommentProps {
   username: string;
   id: string;
   content: string;
   timeAgo: string;
   votes: number;
   isOwner?: boolean;
   isReply?: boolean;
   onReply?: () => void;
onDelete?: () => void;
}

export default function CommentBubble({
   username,
   content,
   timeAgo,
   isOwner = false,
   isReply = false,
   onReply,
   onDelete
}: CommentProps) {

   return (
      <div className={clsx('card shadow', isReply ? 'ml-8' : 'mt-4')}>
         <div className="card-body p-4 flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
               <span className="font-semibold">{username}</span>
               {isOwner && <span className="badge badge-primary text-white text-xs font-semibold">You</span>}
               <span className="text-sm text-gray-500">{timeAgo}</span>
            </div>

            <div className="text-sm text-base-content">{content}</div>
{/* 
            <div className="flex justify-between items-center text-sm">
               {/* <div className="flex items-center gap-1 bg-base-200 rounded-full px-2 py-1">
            <button className="btn btn-xs btn-ghost p-1 min-h-0 h-auto"><Plus size={14} /></button>
            <span className="px-1 font-medium">{votes}</span>
            <button className="btn btn-xs btn-ghost p-1 min-h-0 h-auto"><Minus size={14} /></button>
          </div> */}

            <div className="flex items-center gap-2">
               <button className="btn btn-xs btn-ghost" onClick={onReply}>
                  <MessageCircle size={16} className="mr-1" /> Reply
               </button>
               {isOwner && (
                  <>
                     <button className="btn btn-xs btn-ghost" onClick={onDelete}>
                        <Trash2 size={16} className="mr-1" /> Delete
                     </button>
                     <button className="btn btn-xs btn-ghost">
                        <Edit size={16} className="mr-1" /> Edit
                     </button>
                  </>
               )}
            </div>
            {/* </div> */}
         </div>
      </div>
   );
}
