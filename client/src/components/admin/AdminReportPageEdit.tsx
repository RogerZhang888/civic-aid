import { useState } from "react";
import { Report, ReportStatusTypes } from "../types"
import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function AdminReportPageEdit({
   report
}: {
   report: Report
}) {

   const [selectedStatus, setSelectedStatus] = useState<ReportStatusTypes>(report.status);
   const [remarksForm, setRemarksForm] = useState<string>(report.remarks || "");
   const queryClient = useQueryClient();

   async function handleSave() {

      try {

         await axios.patch(
            `${SERVER_API_URL}/api/gov/reports/${report.id}`, 
            { 
               newStatus: selectedStatus,
               remarks: remarksForm
            },
            { withCredentials: true }
         );

         queryClient.refetchQueries({ queryKey: ['reports', "/gov/reports"] });
         toast.success('Report updated successfully');
   
      } catch (error) {

         console.error(`Error updating status: ${error}`);
         if (axios.isAxiosError(error)) {
            toast.error(`Error: ${error.response?.data.error || error.message}`);
         } else {
            toast.error('An unknown error occurred. Please try again later.');
         }
         
      }
   };

   return (
      <div>
         <div className="font-semibold text-lg m-3">Edit status to:</div>
         <select
            className="select select-bordered w-full"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ReportStatusTypes)}
         >
            <option>pending</option>
            <option>in progress</option>
            <option>resolved</option>
            <option>rejected</option>
         </select>
         <div className="font-semibold text-lg m-3">Edit remarks to:</div>
         <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Remarks"
            value={remarksForm}
            onChange={(e) => setRemarksForm(e.target.value)}
         />
         <button
            className="btn btn-primary mt-3"
            onClick={handleSave}
         >
            Save
         </button>
      </div>
   )
}
