import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import axios from "axios";
import CommentComponent from "./CommentComponent";
import { Comment } from "../../components/types";
import { formatDistanceToNow } from "date-fns";
import useUser from "../../hooks/useUser";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

function timeAgo(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true });
}


export default function AddComment({
  reportId,
  existingComments,
  refetch,
}: {
  reportId: string;
  existingComments: Comment[];
  refetch: () => void;
}) {
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: user } = useUser();
  const currentUserId = user?.id;


  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await axios.post(
        `${SERVER_API_URL}/api/comment`, 
        { 
          report_id: reportId,
          parent_id: null, 
          text: trimmed,
        }, {
          withCredentials: true
        }

      );
      setInput("");
      refetch(); // re-fetch from server
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
  try {
    await axios.delete(`${SERVER_API_URL}/api/comment/${commentId}`, {
      withCredentials: true,
    });
    refetch(); // refresh comments after delete
  } catch (err) {
    console.error("Failed to delete comment:", err);
  }
};

  return (
    <div>
      <div className="flex items-center space-x-2">
        <textarea
          className="textarea textarea-bordered flex-grow"
          placeholder="Join the conversation"
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitting}
        ></textarea>
        <button onClick={handleSend} className="btn btn-primary" disabled={submitting}>
          <SendHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4">
        {existingComments
        .filter((comment) => !comment.deleted)
        .map((comment) => (
          <CommentComponent
            key={comment.id}
            id={comment.id}
            content={comment.text}
            timeAgo={timeAgo(comment.createdAt)} 
            votes={comment.upvoteCount}
            username={comment.username}
            isOwner={comment.userId === currentUserId}
            onDelete={() => handleDelete(comment.id)}
          />

        ))}
      </div>
    </div>
  );
}
