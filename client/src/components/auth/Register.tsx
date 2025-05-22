import { useForm } from "react-hook-form";
import { Languages, RegisterFields } from "../types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import useTranslation from "../../hooks/useTranslation";
import { useLanguageContext } from "../language/LanguageContext";

const SERVER_API_URL = import.meta.env.VITE_SERVER_API_URL!;

export default function Register() {

   const { t } = useTranslation();
   const { language, toggleLanguage } = useLanguageContext();
   
   const {
      register,
      handleSubmit,
      formState: { errors, isValid, isDirty, isSubmitting },
      reset
   } = useForm<RegisterFields>({
      mode: "onChange",
      resolver: zodResolver(
         z.object({
            username: z.string()
               .nonempty({ message: t('required') as string })
               .refine(s => !s.includes(' '), { message: t('usernameNoSpace') as string })
               .refine(s => 3 <= s.length && s.length <= 50, { message: t('usernameChar') as string }),
         
            email: z.string()
               .nonempty({ message: t('required') as string })
               .email({ message: t('invalidEmail') as string }),
         
            password: z.string()
               .nonempty({ message: t('required') as string }),
            //   .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, { message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number" }),
         
            confirmPassword: z.string()
         
         }).refine(data => data.password === data.confirmPassword, { message: t('psdsMustMatch') as string, path: ["confirmPassword"] })
      ),
      defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
   });

   async function registerHandler(data: RegisterFields) {

      const { username, email, password } = data;

      try {

         console.log(`Attempting to register new user ${username} (${email}) ...`);

         await axios.post(`${SERVER_API_URL}/api/register`, 
            { 
               username, 
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
            if (error.response) {
               toast.error(`Registration failed: ${error.response.data.error}.`);
            } else {
               toast.error(`Registration failed: ${error.request}.`);
            }
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
            <legend className="fieldset-legend text-sm">{t('username')}</legend>
            <input
               {...register("username")}
               type="text"
               autoFocus={true}
               className="input text-lg w-full"
            />
            <span className="fieldset-label text-sm text-red-600 h-3">{errors.username?.message}</span>
         </fieldset>

         <fieldset className="fieldset">
            <legend className="fieldset-legend text-sm">{t('email')}</legend>
            <input
               {...register("email")}
               type="email"
               className="input text-lg w-full"
            />
            <span className="fieldset-label text-sm text-red-600 h-3">{errors.email?.message}</span>
         </fieldset>

         <fieldset className="fieldset">
            <legend className="fieldset-legend text-sm">{t('password')}</legend>
            <input
               {...register("password")}
               type="password"
               className="input text-lg w-full"
            />
            <span className="fieldset-label text-sm text-red-600 h-3">{errors.password?.message}</span>
         </fieldset>

         <fieldset className="fieldset">
            <legend className="fieldset-legend text-sm">{t('confirmPassword')}</legend>
            <input
               {...register("confirmPassword")}
               type="password"
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
                  :  t('register')
               }
            </button>
            <div>
            {t('haveAccount')}{' '}<Link to="/auth" className="link link-info">{t('login')}</Link>
            </div>

            <div className="join join-horizontal">
               {Languages.map(lang =>
                  <button
                     key={lang.code}
                     className={`join-item btn btn-secondary btn-outline ${lang.code === language ? "btn-active" : ""}`}
                     onClick={() => toggleLanguage(lang.code)}
                  >
                     {lang.display}
                  </button>
               )}
            </div>

         </div>


      </form>
   );
};
