import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Notification } from "../components/types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(): Promise<Array<Notification>> {

   try {

        type NotificationsResponse = Array<{
            id: number,
            created_at: string,
            user_id: number | null,
            target: string,
            link: string,
            text: {
                en: string,
                zh: string,
                ms: string,
                ta: string
            },
            read: boolean
        }>
      const res = await axios.get<NotificationsResponse>(
         `${SERVER_API_URL}/api/notifications`, 
         {
            withCredentials: true,
         }
      )
   
      return res.data.map((notification) => {
        return {
            id: notification.id,
            createdAt: new Date(notification.created_at),
            text: notification.text,
            read: notification.read,
            link: notification.link
        }
      }); 

   } catch (error) {
      console.log(`error while getting notifications: ${error}`);
      if (axios.isAxiosError(error)) {
         throw new Error(error.response?.data?.message || 'Getting notifications failed');
      }
      throw new Error('Unexpected error occurred');

   }

}

export default function useNotifications() {
   return useQuery<Array<Notification>, Error>({
      queryKey: ['notifications'],
      queryFn,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: false,
   });
}