import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Comment } from "../components/types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(path: string): Promise<Comment[]> {
  console.log(`Fetching comments from ${path}...`);

  try {
    const res = await axios.get(`${SERVER_API_URL}/api${path}`, {
      withCredentials: true,
    });

    const comments: Comment[] = res.data.map(
      (comment: {
         created_at: string;
         deleted: boolean;
        id: number;
        parent_id: string;
        report_id: string;
        text: string;
        upvote_count: number;
        user_id: number;
        username: string;
      }) => ({
        id: comment.id.toString(),
        reportId: comment.report_id,
        parentId: comment.parent_id,
        upvoteCount: comment.upvote_count,
        text: comment.text,
        createdAt: new Date(comment.created_at),
        deleted: comment.deleted,
        userId: comment.user_id,
        username: comment.username
      } satisfies Comment)
    );

    console.log(`Comments for ${path}:`);
    console.log(comments);

    return comments;

  } catch (error) {
    console.log(`Unable to fetch comments from ${path} due to`, error);
    throw error;
  }
}

export default function useComments(path: string) {
  return useQuery<Comment[], AxiosError>({
    queryKey: [path],
    queryFn: () => queryFn(path),
      staleTime: 0,
      refetchInterval: 60 * 1000,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
  });
}
