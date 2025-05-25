import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Notification } from "../components/types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(): Promise<Array<Notification>> {

   console.log(`Fetching notifications...`);

   try {
      const res = await axios.get<
         {
            id: number;
            created_at: string;
            user_id: number | null;
            target: string;
            link: string;
            text: {
               en: string;
               zh: string;
               ms: string;
               ta: string;
            };
            read: boolean;
         }[]
      >(`${SERVER_API_URL}/api/notifications`, {
         withCredentials: true,
      });

      console.log("Notifications:")
      console.log(res.data)

      return res.data.map(n => {
         return {
            id: n.id,
            createdAt: new Date(n.created_at),
            text: n.text,
            read: n.read,
            link: n.link,
         };
      });

   } catch (error) {
      console.log(`error while getting notifications: ${error}`);
      if (axios.isAxiosError(error)) {
         throw new Error(
            error.response?.data?.message || "Getting notifications failed"
         );
      }
      throw new Error("Unexpected error occurred");
   }
}

export default function useNotifications() {
   return useQuery<Array<Notification>, Error>({
      queryKey: ["notifications"],
      queryFn,
      staleTime: 0,
      refetchInterval: 30 * 1000,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
   });
}
