import { useForm } from "react-hook-form";
import { RegisterFields } from "../types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

const zodSchema = z.object({
   userName: z.string()
      .nonempty({ message: "Required" })
      .refine(s => !s.includes(' '), { message: "Username cannot have spaces" })
      .refine(s => 3 <= s.length && s.length <= 50, { message: "Username must contain between 3 and 50 characters" }),

   email: z.string()
      .nonempty({ message: "Required" })
      .email({ message: "Invalid email" }),

      password: z.string(),
//      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, { message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number" }),

   confirmPassword: z.string()

}).refine(data => data.password === data.confirmPassword, { message: "Passwords must match", path: ["confirmPassword"] });

export default function Register() {
   
   const {
      register,
      handleSubmit,
      formState: { errors, isValid, isDirty, isSubmitting },
      trigger,
      reset
   } = useForm<RegisterFields>({
      resolver: zodResolver(zodSchema),
      defaultValues: { userName: "", email: "", password: "", confirmPassword: "" },
   });

   async function registerHandler(data: RegisterFields) {

      const { userName, email, password } = data;

      try {

         console.log(`Attempting to register new user ${userName} (${email}) ...`);

         await axios.post(`${SERVER_API_URL}/api/register`, 
            { 
               name: userName, 
               email, 
               password 
            }
         );

         reset();

         toast.success("Your account has been created! You may log in now.");

         console.log(`New user ${email} was registered successfully`);

      } catch (error) {
         
         console.log(`Unsuccessful registration for ${email} due to: \n${error}`);

         if (axios.isAxiosError(error)) {
            toast.error(`Registration failed: ${error.message}.`);
         } else {
            toast.error("An unknown error occured. Try again later.");
         }
      }
   }

   return (
      <form 
         onSubmit={handleSubmit(registerHandler)}
         className="min-w-1/2 py-5 px-10 bg-white rounded-lg space-y-1 shadow-[0_0_10px_4px_rgba(0,0,0,0.2)]"
      >

         <fieldset className="fieldset">
            <legend className="fieldset-legend text-sm">Username</legend>
            <input
               {...register("userName", { required: true })}
               type="text"
               onBlur={() => trigger("userName")}
               autoFocus={true}
               className="input text-lg w-full"
            />
            <span className="fieldset-label text-sm text-red-600 h-3">{errors.userName?.message}</span>
         </fieldset>

         <fieldset className="fieldset">
            <legend className="fieldset-legend text-sm">Email</legend>
            <input
               {...register("email", { required: true })}
               type="email"
               onBlur={() => trigger("email")}
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

         <fieldset className="fieldset">
            <legend className="fieldset-legend text-sm">Confirm Password</legend>
            <input
               {...register("confirmPassword", { required: true })}
               type="password"
               onBlur={() => trigger("confirmPassword")}
               className="input text-lg w-full"
            />
            <span className="fieldset-label text-sm text-red-600 h-3">{errors.confirmPassword?.message}</span>
         </fieldset>

         <div className="flex flex-col items-center space-y-4">
            <button
               type="submit"
               disabled={!isDirty || !isValid || isSubmitting}
               className="btn btn-wide btn-lg btn-success"
            >
               {isSubmitting 
                  ?  <span className="loading loading-dots loading-md"/>
                  :  "Register"
               }
            </button>
            <div>
               Have an account? <Link to="/auth" className="link">Log In</Link>
            </div>
         </div>


      </form>
   );
};
