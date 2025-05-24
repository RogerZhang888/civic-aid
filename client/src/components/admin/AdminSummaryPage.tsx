import axios from "axios";
import { useState } from "react";
import { ReportSummary } from "../types";
import toast from "react-hot-toast";
import AdminSummariesTable from "./AdminSummariesTable";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function AdminSummaryPage() {

   const [summaries, setSummaries] = useState<ReportSummary[]>([]);
   const [isfetching, setIsFetching] = useState(false);

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

         <div className="text-2xl font-semibold">Report Summaries</div>

         <button
            className="btn btn-primary btn-outline"
            onClick={fetchSummary}
         >
            {isfetching ? "Loading..." : "Get Summaries"}
         </button>

         <div className="w-full">
            <AdminSummariesTable summaries={summaries}/>
         </div>
      </section>
   )
}
