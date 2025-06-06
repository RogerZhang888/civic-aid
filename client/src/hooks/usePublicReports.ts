import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { PublicReport, ReportStatusTypes } from "../components/types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(): Promise<PublicReport[]> {
   console.log("Fetching public reports...");

   try {
      const res = await axios.get(
         `${SERVER_API_URL}/api/reports/public`, 
         {
            withCredentials: true,
         }
      );

      console.log("Public reports: ");
      console.log(res.data);

      const reports: PublicReport[] = res.data.map(
         (report: {
            id: string;
            user_id: number;
            username: string;
            chat_id: string;
            title: string;
            description: string;
            media_url: Array<string>;
            incident_address: string | null;
            agency: string;
            recommended_steps: string;
            urgency: number;
            report_confidence: number;
            status: string;
            is_public: boolean;
            created_at: string;
            resolved_at: string;
            remarks: string;
            upvote_count: number;
         }) => {
            return {
               id: report.id,
               userId: report.user_id.toString(),
               username: report.username,
               chatId: report.chat_id,
               title: report.title,
               description: report.description,
               mediaUrl: report.media_url,
               incidentAddress: report.incident_address,
               agency: report.agency,
               recommendedSteps: report.recommended_steps,
               urgency: report.urgency,
               reportConfidence: report.report_confidence,
               status: report.status as ReportStatusTypes,
               isPublic: report.is_public,
               createdAt: new Date(report.created_at),
               resolvedAt: report.resolved_at ? new Date(report.resolved_at) : null,
               remarks: report.remarks,
               upvoteCount: report.upvote_count,
            } satisfies PublicReport;
         }
      );

      return reports;
   } catch (error) {
      console.log("Unable to fetch public reports due to", error);
      throw error;
   }
}

export default function usePublicReports() {
   return useQuery<PublicReport[], AxiosError>({
      queryKey: ["public-reports"],
      queryFn,
      staleTime: 5 * 60 * 1000,
      retry: false,
   });
}
