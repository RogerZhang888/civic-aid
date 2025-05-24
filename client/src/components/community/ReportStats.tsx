import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowUp, MessageCircle } from "lucide-react";
import { useParams } from "react-router";
import useReport from "../../hooks/useReport";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL;

export default function ReportStats() {
  const { reportId } = useParams() as { reportId: string };
  const { report, isLoading, error } = useReport(reportId);
  const [votes, setVotes] = useState<number>(0);
  const [voteStatus, setVoteStatus] = useState<"upvoted" | "none">("none");
  const [commentCount, setCommentCount] = useState<number>(0);


  const userId = report?.userId; // Replace with actual logged-in user ID

  useEffect(() => {
    if (report && userId) {
      // Set initial vote count
      setVotes(report.upvoteCount || 0);

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

  const handleUpvote = async () => {
    try {
      if (voteStatus === "upvoted") {
        await axios.post(
          `${SERVER_API_URL}/api/reports/undo_upvote/${reportId}`,
          { userId, reportId },
          { withCredentials: true }
        );
        setVotes((v) => v - 1);
        setVoteStatus("none");
      } else {
        await axios.post(
          `${SERVER_API_URL}/api/reports/upvote/${reportId}`,
          { userId, reportId },
          { withCredentials: true }
        );
        setVotes((v) => v + 1);
        setVoteStatus("upvoted");
      }
    } catch (error) {
      console.error("Vote update failed:", error);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load report.</p>;

  return (
    <div className="flex space-x-4 mt-6">
      {/* Votes Bubble */}
      <div className="flex items-center space-x-2 bg-primary text-neutral-content rounded-full px-4 py-1">
        <button onClick={handleUpvote}>
          <ArrowUp size={16} className={voteStatus === "upvoted" ? "text-warning" : ""} />
        </button>
        <span>{votes}</span>
      </div>

      {/* Comments Bubble (static for now) */}
      <div className="flex items-center space-x-2 bg-primary text-neutral-content rounded-full px-4 py-1">
        <MessageCircle size={16} />
        <span>{commentCount}</span>
      </div>
    </div>
  );
}
