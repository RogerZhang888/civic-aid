import axios from "axios";
import { Report } from "../types";
import toast from "react-hot-toast";
import { useState } from "react";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function AdminSummary() {

   const [summaries, setSummaries] = useState<Report[]>([]);
   const [isfetching, setIsFetching] = useState(false);

   async function fetchSummary() {

      setIsFetching(true);

      try {

         const res = await axios.get<Report[]>(
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
            className="btn btn-lg btn-primary"
            onClick={fetchSummary}
         >
            Get Summary
         </button>
         <div className="overflow-x-auto">
            <table className="table w-full">
               <tbody>
                  {
                     !isfetching ? (
                        summaries.map((summary) => (
                           <tr key={summary.id}>
                              <td>{summary.id}</td>
                              <td>{summary.title}</td>
                              <td>{summary.description}</td>
                              <td>{summary.recommended_steps}</td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td colSpan={4} className="text-center">
                              Loading...
                           </td>
                        </tr>
                     )
                  }
               </tbody>
            </table>
         </div>
      </div>
   )
}
