import axios from "axios";
import { useEffect, useState } from "react";
import { ReportSummary } from "../types";
import toast from "react-hot-toast";
import AdminSummariesTable from "./AdminSummariesTable";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function AdminSummaryPage() {

   const [summaries, setSummaries] = useState<ReportSummary[]>([]);
   const [isfetching, setIsFetching] = useState(false);

   useEffect(() => {
      fetchSummary();
   }, [])

   async function fetchSummary() {

      setIsFetching(true);

      try {

         const res = await axios.get<ReportSummary[]>(
            `${SERVER_API_URL}/api/gov/reports_summary`,
            { withCredentials: true }
         )

         const newSummaries = res.data;

         console.log("Report summaries:");
         console.log(newSummaries);

         setSummaries(newSummaries);

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
      <section className="w-full h-full flex flex-col items-center space-y-4 p-4" id="admin-summary">

         <title>CivicAId - Report Summaries</title>

         <div className="text-2xl font-semibold">Report Summaries</div>

         <button
            className="btn btn-primary btn-outline"
            onClick={fetchSummary}
            disabled={isfetching}
         >
            {isfetching 
               ?  <div className="flex flex-row items-center space-x-2">
                     <div className="loading loading-spinner text-gray-700"/>
                     <div>Loading Summaries...</div>
                  </div>
               :  "Refetch Summaries"
            }
         </button>

         <div className="w-full">
            <AdminSummariesTable summaries={summaries}/>
         </div>
      </section>
   )
}
