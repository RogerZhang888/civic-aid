import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Comment } from "../types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(path: string): Promise<Comment[]> {
   console.log(`Fetching from ${path}...`);

   try {
      const res = await axios.get(`${SERVER_API_URL}/api${path}`, {
         withCredentials: true,
      });

      const comments: Comment[] = res.data.map(
         (comment: {
            id: string;
            report_id: string;
            parent_id: string;
            upvote_count: string;
            text: string;
            created_at: string;
         }) => {

            return {
               id: comment.id,
               reportId: comment.report_id,
               parentId: comment.parent_id,
               upvoteCount: comment.upvote_count,
               content: comment.text,
               createdAt: new Date(comment.created_at),
            };
         }
      );

      return comments;
   } catch (error) {
      console.log(`Unable to fetch reports from ${path} due to`, error);
      throw error;
   }
}

export default function useComments(path: string = "/reports") {
   return useQuery<Comment[], AxiosError>({
      queryKey: ["reports", path],
      queryFn: () => queryFn(path),
      staleTime: 5 * 60 * 1000,
      retry: false,
   });
}
