import { useNavigate } from "react-router";
import { PublicReport, Report } from "../types";
import { useState } from "react";
import useTranslation from "../../hooks/useTranslation";
import getBadgeClass from "../../hooks/getBadgeClass";
import { Calendar, FileWarning, User } from "lucide-react";
import useUser from "../../hooks/useUser";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

function capitalize(word: string) {
   if (!word) return '';
   return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatDate(date: Date) {
   const d = new Date(date);
   const day = String(d.getDate()).padStart(2, '0');
   const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-based
   const year = String(d.getFullYear()).slice(-2);
   const hours = String(d.getHours()).padStart(2, '0');
   const minutes = String(d.getMinutes()).padStart(2, '0');
   
   return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function ReportCard({ report, loc }: { report: Report | PublicReport, loc: "/community" | "/profile" }) {

   const navigate = useNavigate();
   const { t } = useTranslation();
   const { data: user } = useUser();

   const [imageError, setImageError] = useState(false);

   const {
      mediaUrl,
      title,
      description,
      id,
      createdAt,
      status,
      isPublic,
   } = report;

   const reportCreator = "username" in report ? report.username : undefined;

   const imgSrc = mediaUrl.length > 0 
      ?  `${SERVER_API_URL}/api/files/${mediaUrl[0]}`
      :  "/placeholderImg.png"

   return (
      <div className="card shadow-lg h-100 w-75 relative hover:shadow-xl duration-300 hover:-translate-y-1 transition">
         <div className="absolute top-2 left-2 space-x-2">
            <span className={`badge ${getBadgeClass(status)} p-3 font-semibold shadow-[0_0_2px_1px_rgba(0,0,0,0.3)]`}>
               {capitalize(t(status) as string)}
            </span>
            {loc === "/profile" && 
               <span className={`${isPublic === true ? "" : "hidden"} badge badge-primary p-3 font-semibold shadow-[0_0_2px_1px_rgba(0,0,0,0.3)]`}>
                  {t('public')}
               </span>
            }
         </div>
         <figure className="h-40 overflow-hidden rounded-t-xl">
            {imageError ? (
               <div className="h-40 w-full bg-gray-200 flex flex-row items-center justify-center space-x-2 text-gray-500">
                  <FileWarning size={18}/>
                  <span>{t('imgNotAvail')}</span>
               </div>
            ) : (
               <img
                  src={imgSrc}
                  alt="Preview image"
                  className="object-cover w-full h-full"
                  onError={() => setImageError(true)}
               />
            )}
         </figure>
         <div className="card-body">
            {loc === "/community" &&
               <div className="flex items-center gap-1 text-sm text-gray-600 -mt-3">
                  <User size={15} strokeWidth={2}/>
                  <span>{reportCreator}</span>
                  {user?.username === reportCreator &&
                     <span className="badge badge-primary text-white text-xs font-semibold">You</span>
                  }
               </div>
            }
            <h2 className="card-title line-clamp-2 break-words overflow-hidden max-h-[3em]">
               {title}
            </h2>
            <p className="text-gray-600 text-sm line-clamp-2 break-words overflow-hidden max-h-[3em]">
               {description}
            </p>
            <div className="text-gray-600 text-sm font-mono flex flex-row space-x-2 items-center mt-auto">
               <Calendar size={15}/> <span>{formatDate(createdAt)}</span>
            </div>
            <div className="card-actions">
               <button
                  onClick={() => navigate(`${loc}/${id}`)}
                  className="btn btn-secondary w-full"
               >
                  {t('viewReport')}
               </button>
            </div>
         </div>
      </div>
   );
}
