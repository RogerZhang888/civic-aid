import { useState } from 'react';
import axios from "axios";
import toast from 'react-hot-toast';
import useTranslation from '../../hooks/useTranslation';
import { useQueryClient } from '@tanstack/react-query';

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function ReportVisToggle({ reportId, initialPublic }: { reportId: string, initialPublic: boolean }) {
   const [isPublic, setIsPublic] = useState(initialPublic);
   const [loading, setLoading] = useState(false);
   const { t } = useTranslation();
   const queryClient = useQueryClient();

   const handleToggle = async () => {
      const newStatus = !isPublic;
      setLoading(true);
      try {
         console.log(`Attempting to set report ${reportId} to ${newStatus ? 'public' : 'private'}...`);
         await axios.post(`${SERVER_API_URL}/api/reports/set_is_public/${reportId}`,
            { is_public: newStatus },
            { withCredentials: true }
         );
         setIsPublic(newStatus); // Update UI only after success
         await queryClient.refetchQueries({ queryKey: ['/reports'] });
         toast.success(`Your report was updated to be ${newStatus ? 'public' : 'private'}.`);
      } catch (err) {
         console.error('Error updating visibility:', err);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="flex items-center gap-2">
         <input
            type="checkbox"
            checked={isPublic}
            onChange={handleToggle}
            disabled={loading}
            className="toggle toggle-primary"
         />
         <span className="text-sm font-medium">{isPublic ? t('public') : t('private')}</span>
      </div>
   );
}