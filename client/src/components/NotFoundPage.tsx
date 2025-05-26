import { ArrowLeft, FileSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
   const navigate = useNavigate();

   return (
      <section className="w-full h-full flex flex-col justify-center items-center gap-6" id="404-page">

         <title>404 Not Found</title>

         <div className="flex flex-col items-center gap-4">
            <FileSearch className="w-16 h-16 text-gray-400" />
            <h1 className="text-4xl font-bold text-gray-700">404</h1>
            <p className="text-xl text-gray-500">Page not found</p>
            <p className="text-gray-400 text-center max-w-md">
               The page you're looking for doesn't exist, or has been moved.
            </p>
         </div>
         <button
            onClick={() => navigate("/")}
            className="btn btn-secondary btn-lg"
         >
            <ArrowLeft className="w-5 h-5" />
            <span>Return to Home</span>
         </button>
      </section>
   );
}