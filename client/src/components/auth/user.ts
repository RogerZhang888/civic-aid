import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { User } from "../types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(): Promise<User> {

   console.log("inkoving useUser...")

   const res = await axios.get<User>(
      `${SERVER_API_URL}/api/protected`, 
      {
         withCredentials: true,
      }
   );

   console.log("response from server for useUser:");
   console.log(res.data);

   return res.data; 
}

export default function useUser() {
   return useQuery<User, AxiosError>({
      queryKey: ['current-user'],
      queryFn,
      staleTime: 5 * 60 * 1000,
      retry: false,
   });
}