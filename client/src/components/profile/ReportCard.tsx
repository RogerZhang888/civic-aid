import { useNavigate } from "react-router";
import { Report } from "../types";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function ReportCard({ report }: { report: Report }) {

   const navigate = useNavigate();

   const {
      mediaUrl,
      title,
      description,
      id
   } = report;

   const imgSrc = mediaUrl.length > 0 
      ?  `${SERVER_API_URL}/files/${mediaUrl[0]}`
      :  "/mascot.png"

   return (
      <div className="card shadow-lg">
         <figure>
            <img
               src={imgSrc}
               alt="Preview image"
               className="object-cover w-full h-full"
            />
         </figure>
         <div className="card-body">
            <h2 className="card-title">
               {title}
            </h2>
            <p className="text-gray-600 text-sm">
               {description}
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
