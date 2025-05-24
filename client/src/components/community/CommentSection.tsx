import AddComment from "./AddComment";
import useComments from "../../hooks/useComments";
import useTranslation from "../../hooks/useTranslation";

export default function CommentSection({ reportId }: { reportId: string }) {
  const { comments, loading, refetch } = useComments(`/comments/${reportId}`);
   const { t } = useTranslation();

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">{t('comments')}</h2>
      {loading ? (
        <p className="text-neutral">{t('loadingComments')}</p>
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
