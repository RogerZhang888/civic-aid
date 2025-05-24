import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Comment } from "../components/types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

async function queryFn(path: string): Promise<Comment[]> {
  console.log(`Fetching from ${path}...`);

  try {
    const res = await axios.get(`${SERVER_API_URL}/api${path}`, {
      withCredentials: true,
    });

    const comments: Comment[] = res.data.map(
      (comment: {
        id: number;
        report_id: string;
        parent_id: string;
        upvote_count: number;
        text: string;
        created_at: string;
        deleted: boolean;
        user_id: number;
      }) => ({
        id: comment.id,
        reportId: comment.report_id,
        parentId: comment.parent_id,
        upvoteCount: comment.upvote_count,
        text: comment.text,
        createdAt: new Date(comment.created_at),
        deleted: comment.deleted,
        userId: comment.user_id
      })
    );

    return comments;
  } catch (error) {
    console.log(`Unable to fetch comments from ${path} due to`, error);
    throw error;
  }
}

export default function useComments(path: string) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<Comment[], AxiosError>({
    queryKey: ["comments", path],
    queryFn: () => queryFn(path),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    comments: data ?? [],
    loading: isLoading,
    error,
    refetch,
  };
}
