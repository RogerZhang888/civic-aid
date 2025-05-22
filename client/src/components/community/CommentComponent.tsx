import { MessageCircle, Trash2, Edit, Plus, Minus } from 'lucide-react';
import clsx from 'clsx';

interface CommentProps {
  id: string;
  content: string;
  timeAgo: string;
  votes: number;
  isOwner?: boolean;
  isReply?: boolean;
  onReply?: () => void;
   username: string;
}

export default function CommentComponent({
  username,
  content,
  timeAgo,
  votes,
  isOwner = false,
  isReply = false,
  onReply,
}: CommentProps) {
  return (
    <div className={clsx('card shadow-sm bg-base-100', isReply ? 'ml-8' : 'mt-4')}>
      <div className="card-body p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">{username}</span>
          {isOwner && (
            <span className="badge badge-primary text-white text-xs">You</span>
          )}
          <span className="text-sm text-gray-500">{timeAgo}</span>
        </div>

        <p className="text-sm mb-4 text-base-content">{content}</p>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1 bg-base-200 rounded-full px-2 py-1">
            <button className="btn btn-xs btn-ghost p-1 min-h-0 h-auto"><Plus size={14} /></button>
            <span className="px-1 font-medium">{votes}</span>
            <button className="btn btn-xs btn-ghost p-1 min-h-0 h-auto"><Minus size={14} /></button>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn btn-xs btn-ghost" onClick={onReply}>
              <MessageCircle size={16} className="mr-1" /> Reply
            </button>
            {isOwner && (
              <>
                <button className="btn btn-xs btn-ghost">
                  <Trash2 size={16} className="mr-1" /> Delete
                </button>
                <button className="btn btn-xs btn-ghost">
                  <Edit size={16} className="mr-1" /> Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
