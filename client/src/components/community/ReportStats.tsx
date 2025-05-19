import { useState } from "react";
import axios from "axios";
import { ArrowUp, ArrowDown, MessageCircle } from "lucide-react";
import { useParams } from 'react-router';

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL;

export default function ReportStats() {
   const { reportId } = useParams() as { reportId: string };
   const [votes, setVotes] = useState(133);
   const [voteStatus, setVoteStatus] = useState<"upvoted" | "downvoted" | "none">("none");
   
   const updateVote = async (direction: "up" | "down") => {
      try {
         await axios.patch(`${SERVER_API_URL}/api/reports/${reportId}/vote`, {
            direction,
         }, {
            withCredentials: true,
         });
      } catch (error) {
         console.error("Vote update failed:", error);
      }
   };

   const handleUpvote = () => {
      if (voteStatus === "upvoted") {
         setVotes(votes - 1);
         setVoteStatus("none");
         updateVote("down");
      } else if (voteStatus === "downvoted") {
         setVotes(votes + 2);
         setVoteStatus("upvoted");
         updateVote("up");
      } else {
         setVotes(votes + 1);
         setVoteStatus("upvoted");
         updateVote("up");
      }
   };

   const handleDownvote = () => {
      if (voteStatus === "downvoted") {
         setVotes(votes + 1);
         setVoteStatus("none");
         updateVote("up");
      } else if (voteStatus === "upvoted") {
         setVotes(votes - 2);
         setVoteStatus("downvoted");
         updateVote("down");
      } else {
         setVotes(votes - 1);
         setVoteStatus("downvoted");
         updateVote("down");
      }
   };

   return (
      <div className="flex space-x-4 mt-6">
         {/* Votes Bubble */}
         <div className="flex items-center space-x-2 bg-primary text-neutral-content rounded-full px-4 py-1">
            <button onClick={handleUpvote}>
               <ArrowUp size={16} className={voteStatus === "upvoted" ? "text-warning" : ""} />
            </button>
            <span>{votes}</span>
            <button onClick={handleDownvote}>
               <ArrowDown size={16} className={voteStatus === "downvoted" ? "text-warning" : ""} />
            </button>
         </div>

         {/* Comments Bubble (static for now) */}
         <div className="flex items-center space-x-2 bg-primary text-neutral-content rounded-full px-4 py-1">
            <MessageCircle size={16} />
            <span>58</span>
         </div>
      </div>
   );
}

