import useUser from '../../hooks/useUser';
import AdminReportsTable from './AdminReportsTable';
import AdminSummary from './AdminSummary';

export default function AdminPage() {
   const { data: admin, isLoading: isAdminLoading } = useUser();

   if (!admin || isAdminLoading) {
      return <div className="w-full h-full flex justify-center items-center">Loading admin panel...</div>;
   }

   return (
      <section className="w-full h-full flex flex-col items-center space-y-4 p-4" id="admin-panel">
         
         <div className="text-2xl font-semibold">Admin Panel</div>

         <AdminSummary/>

         <div className="flex flex-col w-full">
            <AdminReportsTable/>
         </div>
      </section>
   );
}