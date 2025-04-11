import { useForm } from "react-hook-form";
import { useAuth } from "./AuthContext";
import { LoginFields } from "../types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

const zodSchema = z.object({
   email: z.string().nonempty({ message: "Required" }).email({ message: "Invalid email" }),
   password: z.string().nonempty({ message: "Required" }),
})

export default function Login() {
   const { cvaLogin } = useAuth();
   
   const {
      register,
      handleSubmit,
      formState: { errors, isValid, isDirty, isSubmitting },
      trigger
   } = useForm<LoginFields>({
      resolver: zodResolver(zodSchema),
      defaultValues: { email: "", password: "" },
   });

   return (
      <form 
         onSubmit={
            handleSubmit(async (fd) => await cvaLogin(fd.email, fd.password))
         }
         className="min-w-1/2 py-5 px-10 bg-white rounded-lg space-y-1 shadow-[0_0_10px_4px_rgba(0,0,0,0.2)]"
      >

         <fieldset className="fieldset">
            <legend className="fieldset-legend text-sm">Email</legend>
            <input
               {...register("email", { required: true })}
               type="email"
               onBlur={() => trigger("email")}
               autoFocus={true}
               className="input text-lg w-full"
            />
            <span className="fieldset-label text-sm text-red-600 h-3">{errors.email?.message}</span>
         </fieldset>

         <fieldset className="fieldset">
            <legend className="fieldset-legend text-sm">Password</legend>
            <input
               {...register("password", { required: true })}
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
               className="btn btn-wide btn-lg btn-success"
            >
               {isSubmitting 
                  ?  <span className="loading loading-dots loading-md"/>
                  :  "Log In"
               }
            </button>
            <div>
               No account? <Link to="/auth/reg" className="link">Register</Link>
            </div>
         </div>


      </form>
   );
};
