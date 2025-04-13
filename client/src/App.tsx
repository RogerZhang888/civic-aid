import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import AuthRoutesWrapper from "./components/auth/AuthRoutesWrapper";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Chatbot from "./components/chatbot/Chatbot";
import MainLayout from "./components/MainLayout";
import ProfilePage from "./components/profile/ProfilePage";
import HomePage from "./components/HomePage";
import NotFound from "./components/NotFound";
import ProtectedRoutesWrapper from "./components/auth/ProtectedRoutesWrapper";

export default function App() {
   return (
      <BrowserRouter>
         <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <Toaster/>
            <Routes>

               <Route element={<MainLayout/>}>

                  <Route path="/" element={<HomePage/>} />

                  {/* 
                     The /chatbot and /profile routes are protected
                     only authenticated users can go there
                     if not, redirected to /login
                     */}
                  <Route element={<ProtectedRoutesWrapper/>}>

                     <Route path="/chatbot" element={<Chatbot />} />

                     <Route path="/profile" element={<ProfilePage/>} />

                  </Route>

                  {/* 
                     The /auth (login) and /auth/reg (register) routes
                     can only be accessed if a user is NOT logged in
                     */}
                  <Route path="/auth" element={<AuthRoutesWrapper/>}>

                     <Route index element={<Login/>}/>

                     <Route path="reg" element={<Register/>}/>

                  </Route>

                  <Route path="*" element={<NotFound />} />

               </Route>
               
            </Routes>
         </ErrorBoundary>
      </BrowserRouter>
   );
}
