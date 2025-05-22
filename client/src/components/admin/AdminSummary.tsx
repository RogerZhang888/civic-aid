import axios from "axios";
import { ReportSummary } from "../types";
import toast from "react-hot-toast";
import { useState } from "react";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function AdminSummary() {

   const [summaries, setSummaries] = useState<ReportSummary[]>([]);
   const [isfetching, setIsFetching] = useState(false);

   async function fetchSummary() {

      setIsFetching(true);

      try {

         const res = await axios.get<ReportSummary[]>(
            `${SERVER_API_URL}/api/gov/reports_summary`,
            { withCredentials: true }
         )

         const summaries = res.data;

         setSummaries(summaries);

      } catch (error) {
         console.error(`Error fetching summary: ${error}`);
         if (axios.isAxiosError(error)) {
            toast.error(`Error: ${error.response?.data.error || error.message}`);
         } else {
            toast.error('An unknown error occurred. Please try again later.');
         }
      } finally {
         setIsFetching(false);
      }
   }

   return (
      <div>
         <button
            className="btn btn-primary btn-outline"
            onClick={fetchSummary}
         >
            Get Summary
         </button>
         <div className="overflow-x-auto">
            <table className="table w-full">
               <tbody>
                  {
                     !isfetching ? 
                        summaries.map((summary, idx) => 
                           <tr key={idx}>
                              <td>{idx+1}</td>
                              <td>{summary.title}</td>
                              <td>{summary.recommendedSteps}</td>
                              <td>{summary.urgency}</td>
                              <td>{summary.confidence}</td>
                              <td>{summary.sources}</td>
                           </tr>
                        )
                     : 
                        <tr>
                           <td colSpan={4} className="text-center">
                              Loading...
                           </td>
                        </tr>
                     
                  }
               </tbody>
            </table>
         </div>
      </div>
   )
}
