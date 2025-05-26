import { Link } from 'react-router';
import useUser from '../../hooks/useUser';
import GenericLoading from '../GenericLoading';
import AdminReportsTable from './AdminReportsTable';
import { ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
   const { data: admin, isLoading: isAdminLoading } = useUser();

   if (!admin || isAdminLoading) {
      return <GenericLoading str="Loading admin panel..."/>;
   }

   return (
      <section className="w-full h-full flex flex-col items-center space-y-4 p-4" id="admin-dashboard">

         <title>CivicAId - Admin Dashboard</title>
         
         <div className="text-2xl font-semibold">Admin Dashboard</div>

         <Link
            to="/admin/summary"
            className='btn btn-link'
         >
            Get Summaries<ArrowRight/>
         </Link>

         <div className="w-full">
            <AdminReportsTable/>
         </div>
      </section>
   );
}