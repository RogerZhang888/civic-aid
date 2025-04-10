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
         className="lg:w-1/3 md:w-2/3 w-4/5 h-1/2 p-6 bg-white rounded-lg shadow-md space-y-6 text-xl"
      >

         <label className="block">
            <span className="text-gray-700">Email</span>
            <input
               {...register("email", { required: true })}
               type="email"
               onBlur={() => trigger("email")}
               autoFocus={true}
               className="mt-1 p-2 block w-full rounded-md border-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span className="mt-1 text-sm text-red-600">{errors.email?.message}</span>
         </label>

         <label className="block">
            <span className="text-gray-700">Password</span>
            <input
               {...register("password", { required: true })}
               type="password"
               onBlur={() => trigger("password")}
               className="mt-1 p-2 block w-full rounded-md border-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span className="mt-1 text-sm text-red-600">{errors.password?.message}</span>
         </label>

         <button
            type="submit"
            disabled={!isDirty || !isValid || isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
         >
            {isSubmitting ? "Loading..." : "Log In"}
         </button>

         <Link to="/auth/reg" className="text-blue-600">Register</Link>

      </form>
   );
};
