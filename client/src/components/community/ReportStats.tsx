import { useState, useEffect } from "react";
import axios from "axios";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { useParams } from "react-router";
import useIndividualReport from "../../hooks/useIndividualReport";
import { useQueryClient } from "@tanstack/react-query";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL;

export default function ReportStats() {
   const { reportId } = useParams() as { reportId: string };
   const { data: report, isLoading, error } = useIndividualReport(reportId);
   const [voteStatus, setVoteStatus] = useState<"upvoted" | "none">("none");
   const queryClient = useQueryClient();
   const [commentCount, setCommentCount] = useState<number>(0);

   const [isAnimUpvotes, setIsAnimUpvotes] = useState(false);

   const userId = report?.userId; // Replace with actual logged-in user ID

   useEffect(() => {
      if (report && userId) {

         // Check if user has upvoted this report
         axios
            .get(`${SERVER_API_URL}/api/reports/upvote_status`, { withCredentials: true })
            .then((res) => {
               const upvotedReportIds: string[] = res.data;
               const hasUpvoted = upvotedReportIds.includes(reportId);
               setVoteStatus(hasUpvoted ? "upvoted" : "none");
            })
            .catch((err) => {
               console.error("Failed to fetch vote status:", err);
            });

         // Fetch comment count
         axios
            .get(`${SERVER_API_URL}/api/comments/${reportId}`, { withCredentials: true })
            .then((res) => {
               setCommentCount(res.data.length);
            })
            .catch((err) => {
               console.error("Failed to fetch comment count:", err);
            });
      }
   }, [report, userId, reportId]);

   const handleUpvoteClick = async () => {

      try {

         if (voteStatus === "upvoted") {

            await axios.post(
               `${SERVER_API_URL}/api/reports/undo_upvote/${reportId}`,
               { userId, reportId },
               { withCredentials: true }
            );
            setVoteStatus("none");
         } else {
            setIsAnimUpvotes(true);
            setTimeout(() => setIsAnimUpvotes(false), 300);
            await axios.post(
               `${SERVER_API_URL}/api/reports/upvote/${reportId}`,
               { userId, reportId },
               { withCredentials: true }
            );
            setVoteStatus("upvoted");
         }

         await queryClient.refetchQueries({ queryKey: [reportId] })

      } catch (error) {
         console.error("Vote update failed:", error);
      }
   };

   if (isLoading || !report) return (
      <div className="text-center">
         <div className="loading loading-spinner text-primary"/>
      </div>
   );
   if (error) return <p>Failed to load report.</p>;

   return (
      <div className="mx-auto flex flex-row space-x-4 font-semibold text-lg">
         <button 
            onClick={handleUpvoteClick}
            className={`
               flex items-center space-x-3 bg-primary text-neutral-content rounded-full px-4 py-1 font-semibold
               hover:cursor-pointer transition-all duration-300 shadow-lg
               ${isAnimUpvotes ? "animate-[bounce_0.5s_ease-in-out_1]" : ""}
               ${voteStatus === "upvoted" ? "ring-2 ring-warning" : ""}
            `}
            style={{
               transform: isAnimUpvotes ? 'translateY(0)' : 'translateY(0)',
               animation: isAnimUpvotes ? 'bounce 0.5s ease-in-out' : 'none'
            }}
         >
            <ThumbsUp
               size={18}
               strokeWidth={3}
               className={voteStatus === "upvoted" ? "text-warning" : ""}
            />
            <span>{report?.upvoteCount}</span>
         </button>

         <div className="flex shadow-lg items-center space-x-3 bg-primary text-neutral-content rounded-full px-4 py-1">
            <MessageCircle size={18} strokeWidth={3} />
            <span>{commentCount}</span>
         </div>
      </div>
   );
}
