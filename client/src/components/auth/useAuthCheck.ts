import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function useAuthCheck() {
   return useQuery({
      queryKey: ["auth-check"],
      queryFn: async () => {
         const res = await axios.get(
            `${SERVER_API_URL}/api/protected`, 
            { withCredentials: true }
         );
         return res.data;
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
   });
}
