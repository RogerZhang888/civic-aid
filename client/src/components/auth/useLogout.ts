import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function useLogout() {

   const navigate = useNavigate();

   return async function logoutHandler() {

      try {
         await axios.post(`${SERVER_API_URL}/api/logout`, {}, { withCredentials: true });

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

   };
}