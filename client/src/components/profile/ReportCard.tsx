import { useNavigate } from "react-router";
import { Report } from "../types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function ReportCard({ report }: { report: Report }) {

   const navigate = useNavigate();

   const {
      mediaUrl,
      title,
      description,
      id,
      createdAt,
      status,
      urgency
   } = report;

   console.log(mediaUrl);

   function formatDate(date: Date) {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-based
      const year = String(d.getFullYear()).slice(-2);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
    
      return `${day}/${month}/${year} ${hours}:${minutes}`;
   }

   const imgSrc = mediaUrl.length > 0 
      ?  `${SERVER_API_URL}/api/files/${mediaUrl[0]}`
      :  "/placeholderImg.png"
   
   const statusColor = status === 'resolved' ? 'badge-success' : 'badge-warning';

   function capitalize(word: string) {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
   }

   const isUrgent = urgency > 0.75;

   return (
      <div className="card shadow-lg h-100 w-75 relative">
         <div className="absolute top-2 left-2 space-x-2">
            <span className={`badge ${statusColor} p-3 font-semibold shadow-[0_0_2px_1px_rgba(0,0,0,0.3)]`}>
               {capitalize(status)}
            </span>
            {isUrgent &&
               <span className="badge badge-error p-3 font-semibold shadow-[0_0_2px_1px_rgba(0,0,0,0.3)]">
                  Urgent
               </span>
            }
         </div>
         <figure className="max-h-40 overflow-hidden rounded-t-xl">
            <img
               src={imgSrc}
               alt="Preview image"
               className="object-cover"
            />
         </figure>
         <div className="card-body">
            <h2 className="card-title">
               {title}
            </h2>
            <p className="text-gray-600 text-sm">
               {description}
            </p>
            <p className="text-gray-600 text-sm">
               Report created on: {formatDate(createdAt)}
            </p>
            <div className="card-actions">
               <button
                  onClick={() => navigate(`/profile/${id}`)}
                  className="btn btn-secondary w-full"
               >
                  View Report
               </button>
            </div>
         </div>
      </div>
   );
}
