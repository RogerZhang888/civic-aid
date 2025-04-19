import { useForm } from "react-hook-form";
import { LoginFields, User } from "../types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

const zodSchema = z.object({
   userName: z.string().nonempty({ message: "Required" }),
   password: z.string().nonempty({ message: "Required" }),
})

export default function Login() {

   const navigate = useNavigate();

   // form handler
   const {
      register,
      handleSubmit,
      formState: { errors, isValid, isDirty, isSubmitting },
      trigger,
      reset
   } = useForm<LoginFields>({
      resolver: zodResolver(zodSchema),
      defaultValues: { userName: "", password: "" },
   });

   const queryClient = useQueryClient();

   async function loginHandler(data: LoginFields) {

      console.log(data);

      const { userName, password } = data;

      try {

         console.log(`Attempting log in for ${userName} ...`);

         const res = await axios.post(
            `${SERVER_API_URL}/api/login`,
            { userName, password },
            { 
               withCredentials: true,
               headers: {
                  'Content-Type': 'application/json'
               }
            }
         );

         const newLoggedInUser = res.data as User;

         queryClient.setQueryData(['current-user'], newLoggedInUser);

         await queryClient.invalidateQueries({ queryKey: ['current-user']});

         reset();

         toast.success(`Welcome, ${newLoggedInUser.userName}`);

         console.log(`Log in successful! Details: \n${JSON.stringify(newLoggedInUser)}`);

         navigate("/chatbot");

      } catch (error) {
         
         console.log(`Log in for ${userName} unsuccessful due to: \n${error}`);

         if (axios.isAxiosError(error)) {
            if (error.response) {
               toast.error(`Login failed: ${error.response.data.error}.`);
            } else {
               toast.error(`Login failed: ${error.request}.`);
            }
         } else {
            toast.error("An unknown error occured. Try again later.");
         }
      }
   }

   return (
      <form 
         onSubmit={handleSubmit(loginHandler)}
         className="min-w-1/2 py-5 px-10 bg-white rounded-lg space-y-1 shadow-[0_0_10px_4px_rgba(0,0,0,0.2)]"
      >

         <fieldset className="fieldset">
            <legend className="fieldset-legend text-sm">Username</legend>
            <input
               {...register("userName")}
               type="text"
               onBlur={() => trigger("userName")}
               autoFocus={true}
               className="input text-lg w-full"
            />
            <span className="fieldset-label text-sm text-red-600 h-3">{errors.userName?.message}</span>
         </fieldset>

         <fieldset className="fieldset">
            <legend className="fieldset-legend text-sm">Password</legend>
            <input
               {...register("password")}
               type="password"
               onBlur={() => trigger("password")}
               className="input text-lg w-full"
            />
            <span className="fieldset-label text-sm text-red-600 h-3">{errors.password?.message}</span>
         </fieldset>

         <div className="flex flex-col items-center space-y-4">
            <button
               type="submit"
               disabled={!isDirty || !isValid || isSubmitting}
               className="btn btn-wide btn-lg bg-primary-content text-primary hover:bg-primary hover:text-primary-content"
            >
               {isSubmitting 
                  ?  <span className="loading loading-dots loading-md"/>
                  :  "Log In"
               }
            </button>
            <div>
               No account? <Link to="/auth/reg" className="link link-hover">Register</Link>
            </div>
         </div>

      </form>
   );
};
