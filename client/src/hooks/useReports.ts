import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Report, ReportStatusTypes } from "../components/types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(path: string): Promise<Report[]> {
   console.log(`Fetching reports using ${path}...`);

   try {
      const res = await axios.get(
         `${SERVER_API_URL}/api${path}${path == "/gov/reports" ? "?include_resolved=1" : ""}`, 
         {
            withCredentials: true,
         }
      );

      console.log("Reports: ");
      console.log(res.data);

      const reports: Report[] = res.data.map(
         (report: {
            id: string;
            user_id: number;
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
            } satisfies Report;
         }
      );

      return reports;
   } catch (error) {
      console.log(`Unable to fetch reports from ${path} due to`, error);
      throw error;
   }
}

export default function useReports(path: string = "/reports") {
   return useQuery<Report[], AxiosError>({
      queryKey: ["reports"],
      queryFn: () => queryFn(path),
      staleTime: 5 * 60 * 1000,
      retry: false,
   });
}
