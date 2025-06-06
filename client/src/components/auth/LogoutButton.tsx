import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useTranslation from "../../hooks/useTranslation";
import axios from "axios";
import toast from "react-hot-toast";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function LogoutButton() {
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const { t } = useTranslation();

   async function logoutHandler() {
      console.log("Logging user out...");

      try {
         await axios.post(
            `${SERVER_API_URL}/api/logout`,
            {},
            { withCredentials: true }
         );

         queryClient.clear();

         console.log("Log out successful");

         toast.success("You successfully logged out");

         navigate("/");
      } catch (error) {
         console.log(`Log out unsuccessful due to: \n${error}`);

         if (axios.isAxiosError(error)) {
            toast.error(`Logout failed: ${error.message}.`);
         } else {
            toast.error("An unknown error occured. Try again later.");
         }
      }
   }

   return (
      <button onClick={logoutHandler} className="btn btn-sm btn-outline">
         {t('logout')}
      </button>
   );
}