import AddComment from "./AddComment";
import useComments from "../../hooks/useComments";

export default function CommentSection({ reportId }: { reportId: string }) {
  const { comments, loading, refetch } = useComments(`/comments/${reportId}`);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      {loading ? (
        <p className="text-neutral">Loading comments...</p>
      ) : (
        <AddComment
          reportId={reportId}
          existingComments={comments}
          refetch={refetch}
        />
      )}
    </section>
  );
}
