import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { User } from "../types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(): Promise<User> {

   console.log("invoking useUser...");

   try {
      
      const res = await axios.get<User>(
         `${SERVER_API_URL}/api/protected`, 
         {
            withCredentials: true,
         }
      );
   
      console.log("user validated");
   
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
   return useQuery<User, AxiosError>({
      queryKey: ['current-user'],
      queryFn,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: false,
   });
}