import { useQueryClient } from "@tanstack/react-query";
import { BookMarked } from "lucide-react";
import { useNavigate } from "react-router";

export default function ReportJSX({ id, agency }: { id: string, agency: string }) {

   const queryClient = useQueryClient();
   const navigate = useNavigate();

   return (
      <div id="answer-for-report-chat" className="space-y-2">
         <div className="text-xl font-semibold">Your Report Has Been Created!</div>
         <p>
            Thank you for being an active citizen! Your report will be sent to {agency} for them to take a look. I'll keep you posted on whether this issue has been resolved!
         </p>
         <button
            className="btn flex flex-row justify-center items-center px-5"
            onClick={async () => {
               await queryClient.refetchQueries({ queryKey: ['reports'] });
               navigate(`/profile/${id}`)
            }}
         >
            <BookMarked /> View your report
         </button>
      </div>
   )
}