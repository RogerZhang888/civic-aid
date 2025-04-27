import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Report } from "../types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(): Promise<Report[]> {

   console.log("invoking useReport...");

   try {
      
        const res = await axios.get(
            `${SERVER_API_URL}/api/reports`, 
            { withCredentials: true }
        );
   
        const reports: Report[] = res.data.map((report:{
            id:string, 
            user_id:number, 
            chat_id:string, 
            title:string, 
            description:string, 
            media_url:Array<string>, 
            location:string, 
            agency:string, 
            recommended_steps:string, 
            urgency:number, 
            report_confidence:number, 
            status:string, 
            created_at:string, 
            resolved_at:string
        }) => {
            return {
                id: report.id,
                userId: report.user_id,
                chatId: report.chat_id,
                title: report.title,
                description: report.description,
                mediaUrl: report.media_url,
                incidentLocation: report.location,
                agency: report.agency,
                recommendedSteps: report.recommended_steps,
                urgency: report.urgency,
                reportConfidence: report.report_confidence,
                status: report.status,
                createdAt: new Date(report.created_at),
                resolvedAt: report.resolved_at ? new Date(report.resolved_at) : null,
            };
        })

      return reports;

    } catch (error) {

        console.log("user not validated");

        throw error;

    }

}

export default function useUser() {
   return useQuery<Report[], AxiosError>({
      queryKey: ['current-user-reports'],
      queryFn,
      staleTime: 5 * 60 * 1000,
      retry: false,
   });
}