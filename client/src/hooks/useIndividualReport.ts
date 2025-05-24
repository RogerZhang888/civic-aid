import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Report, ReportStatusTypes } from "../components/types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(reportId: string): Promise<Report> {
   
   const res = await axios.get(`${SERVER_API_URL}/api/reports/${reportId}`, {
      withCredentials: true,
   });

   const r = res.data;

   return {
      id: r.id,
      userId: r.user_id.toString(),
      chatId: r.chat_id,
      title: r.title,
      description: r.description,
      mediaUrl: r.media_url,
      incidentAddress: r.incident_address,
      agency: r.agency,
      recommendedSteps: r.recommended_steps,
      urgency: r.urgency,
      reportConfidence: r.report_confidence,
      status: r.status as ReportStatusTypes,
      isPublic: r.is_public,
      createdAt: new Date(r.created_at),
      resolvedAt: r.resolved_at ? new Date(r.resolved_at) : null,
      remarks: r.remarks,
      upvoteCount: r.upvote_count,
   } satisfies Report;
}

export default function useIndividualReport(reportId: string) {
   return useQuery<Report, AxiosError>({
      queryKey: [reportId],
      queryFn: () => queryFn(reportId),
      staleTime: 5 * 60 * 1000,
      retry: false,
   });
}
