import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(): Promise<boolean> {

   console.log("invoking useRewards...");

   try {
      
      const res = await axios.get<boolean>(`${SERVER_API_URL}/api/reports_reward`, { withCredentials: true });
      
      return res.data; 

   } catch (error) {

      console.log(`unable to fetch reward status due to error ${error}`);

      throw error;

   }

}

export default function useRewards() {
   return useQuery<boolean, AxiosError>({
      queryKey: ['current-reward'],
      queryFn,
      staleTime: 5 * 60 * 1000,
      retry: false,
   });
}