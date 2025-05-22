import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowUp, ArrowDown, MessageCircle } from "lucide-react";
import { useParams } from "react-router";
import useReport from "../../hooks/useReport"; 

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL;

export default function ReportStats() {
  const { reportId } = useParams() as { reportId: string };
  const { report, isLoading, error } = useReport(reportId);
  const [votes, setVotes] = useState<number>(0);
  const [voteStatus, setVoteStatus] = useState<"upvoted" | "none">("none");
  const userId = report?.userId;

  useEffect(() => {
    if (report) {
      setVotes(report.upvoteCount);
    }
  }, [report]);

  const handleUpvote = async () => {
    try {
      if (voteStatus === "upvoted") {
        await axios.post(`${SERVER_API_URL}/api/reports/undo_upvote/${reportId}`, { userId, reportId }, { withCredentials: true });
        setVotes((v) => v - 1);
        setVoteStatus("none");
      } else {
        await axios.post(`${SERVER_API_URL}/api/reports/upvote/${reportId}`, { userId, reportId }, { withCredentials: true });
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
        <span>58</span>
      </div>
    </div>
  );
}
