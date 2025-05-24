import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

export default function ErrorPage() {
   const navigate = useNavigate();

   return (
      <section className="w-screen h-screen flex flex-col justify-center items-center gap-6" id="error-page">
         <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-16 h-16 text-red-400" />
            <h1 className="text-4xl font-bold text-gray-700">Oops!</h1>
            <p className="text-xl text-gray-500">Something went wrong</p>
            <p className="text-gray-400 text-center max-w-md">
               We encountered an unexpected error. Please try again.
            </p>
         </div>
         <div className="flex gap-4">
            <button
               onClick={() => window.location.reload()}
               className="btn btn-primary btn-lg flex items-center gap-2"
            >
               <RefreshCw className="w-5 h-5" />
               <span>Reload</span>
            </button>
            <button
               onClick={() => navigate("/")}
               className="btn btn-secondary btn-lg flex items-center gap-2"
            >
               <ArrowLeft className="w-5 h-5" />
               <span>Return Home</span>
            </button>
         </div>
      </section>
   );
}