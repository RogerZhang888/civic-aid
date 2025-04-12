import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const SERVER_URL = import.meta.env.SERVER_API_URL!;

export function useAuthCheck() {
   return useQuery({
      queryKey: ["auth-check"],
      queryFn: async () => {
         const { data } = await axios.get(
            `${SERVER_URL}/api/verify-auth`, 
            {
               withCredentials: true,
            }
         );
         return data;
      },
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
   });
}
