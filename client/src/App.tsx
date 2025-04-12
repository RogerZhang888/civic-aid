import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import AuthProvider from "./components/auth/AuthProvider";
import AuthLayout from "./components/auth/AuthLayout";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Chatbot from "./components/chatbot/Chatbot";
import MainLayout from "./components/MainLayout";
import ProfilePage from "./components/profile/ProfilePage";
import HomePage from "./components/HomePage";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
   return (
      <BrowserRouter>
         <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <AuthProvider>
               <Toaster/>
               <Routes>

                  <Route element={<MainLayout/>}>

                     <Route path="/" element={<HomePage/>} />

                     {/* 
                        The /chatbot and /profile routes are protected
                        only authenticated users can go there
                        if not, redirected to /login

                      */}
                     <Route element={<ProtectedRoute/>}>

                        <Route path="/chatbot" element={<Chatbot />} />

                        <Route path="/profile" element={<ProfilePage/>} />

                     </Route>

                     <Route path="/auth" element={<AuthLayout/>}>
                        <Route index element={<Login/>}/>
                        <Route path="reg" element={<Register/>}/>
                     </Route>

                     <Route path="*" element={<NotFound />} />

                  </Route>
                  
               </Routes>
            </AuthProvider>
         </ErrorBoundary>
      </BrowserRouter>
   );
}
