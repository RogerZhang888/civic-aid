import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "../components/types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(): Promise<User> {

   console.log("validating user...");

   try {
      
      const res = await axios.get<User>(
         `${SERVER_API_URL}/api/protected`, 
         {
            withCredentials: true,
         }
      );
   
      console.log(`user ${res.data.username} validated`);
   
      return res.data; 

   } catch (error) {
      console.log(`error while validating user: ${error}`);
      if (axios.isAxiosError(error)) {
         throw new Error(error.response?.data?.message || 'Authentication failed');
      }
      throw new Error('Unexpected error occurred');

   }

}

export default function useUser() {
   return useQuery<User, Error>({
      queryKey: ['current-user'],
      queryFn,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: false,
   });
}