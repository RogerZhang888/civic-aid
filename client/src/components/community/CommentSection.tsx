import AddComment from "./AddComment";
import useComments from "../../hooks/useComments";
import useTranslation from "../../hooks/useTranslation";

export default function CommentSection({ reportId }: { reportId: string }) {
  const { data: comments = [], isLoading, refetch } = useComments(`/comments/${reportId}`);

   const { t } = useTranslation();

  return (
    <section className="mt-2">
      <h2 className="text-xl font-bold mb-4">{t('comments')}</h2>
      {isLoading ? (
         <div className="text-center">
            <div className="loading loading-spinner text-primary"/>
            <div className="mt-2  text-gray-500">{t('loadingComments')}</div>
         </div>
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
