import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { AllowedAgencies, Report, ReportStatusTypes } from "../components/types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(path: string): Promise<Report[]> {
   console.log(`Fetching reports using ${path}...`);

   try {
      const res = await axios.get(`${SERVER_API_URL}/api${path}`, {
         withCredentials: true,
      });

      const reports: Report[] = res.data.map(
         (report: {
            id: string;
            user_id: number;
            chat_id: string;
            title: string;
            description: string;
            media_url: Array<string>;
            longitude?: number;
            latitude?: number;
            agency: string;
            recommended_steps: string;
            urgency: number;
            report_confidence: number;
            status: string;
            is_public: boolean;
            created_at: string;
            resolved_at: string;
         }) => {
            const incidentLocation =
               report.longitude && report.latitude
                  ? {
                       latitude: report.latitude,
                       longitude: report.longitude,
                       altitude: null,
                       accuracy: null,
                       altitudeAccuracy: null,
                       heading: null,
                       speed: null,
                       toJSON() {
                          return this;
                       },
                       [Symbol.toStringTag]: "GeolocationCoordinates",
                    }
                  : null;

            return {
               id: report.id,
               userId: report.user_id.toString(),
               chatId: report.chat_id,
               title: report.title,
               description: report.description,
               mediaUrl: report.media_url,
               incidentLocation,
               agency: report.agency as AllowedAgencies,
               recommended_steps: report.recommended_steps,
               urgency: report.urgency,
               reportConfidence: report.report_confidence,
               status: report.status as ReportStatusTypes,
               isPublic: report.is_public,
               createdAt: new Date(report.created_at),
               resolvedAt: report.resolved_at ? new Date(report.resolved_at) : null,
            };
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
      queryKey: ["reports", path],
      queryFn: () => queryFn(path),
      staleTime: 5 * 60 * 1000,
      retry: false,
   });
}
