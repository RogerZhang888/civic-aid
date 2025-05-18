import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import AuthRoutesWrapper from "./components/auth/AuthRoutesWrapper";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import MainLayout from "./components/MainLayout";
import ProfilePage from "./components/profile/ProfilePage";
import HomePage from "./components/HomePage";
import NotFound from "./components/NotFound";
import ProtectedRoutesWrapper from "./components/auth/ProtectedRoutesWrapper";
import ChatbotWrapper from "./components/chatbot/ChatbotWrapper";
import LanguageProvider from "./components/language/LanguageProvider";
import About from "./components/about/About"; 
import ProfileReportPage from "./components/profile/ProfileReportPage";
import AdminPage from "./components/admin/AdminPage";
import ChatProvider from "./components/chatbot/ChatProvider";
import CommunityPage from "./components/community/CommunityPage";
import CommunityReportPage from "./components/community/CommunityReportPage";

export default function App() {
   return (
      <BrowserRouter>
         <Toaster/>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
               <LanguageProvider>
                  <ChatProvider>
                     <Routes>

                        <Route element={<MainLayout/>}>

                           <Route index element={<HomePage/>} />

                           {/* 
                              The /chatbot and /profile routes are protected
                              only authenticated users can go there
                              if not, redirected to /auth
                              */}
                           <Route element={<ProtectedRoutesWrapper/>}>

                              <Route path="/chatbot/:currChatId?" element={<ChatbotWrapper/>}/>

                              <Route path="/profile">

                                 <Route index element={<ProfilePage/>}/>

                                 <Route path=":reportId" element={<ProfileReportPage/>}/>
                              
                              </Route>

                              <Route path="/community">

                                 <Route index element={<CommunityPage/>}/>

                                 <Route path=":reportId" element={<CommunityReportPage/>}/>
                              
                              </Route>

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
                        
                           <Route path="/about" element={<About />} />

                           <Route path="/admin" element={<AdminPage/>} />

                        </Route>
                        
                     </Routes>
                  </ChatProvider>
            </LanguageProvider>
         </ErrorBoundary>
      </BrowserRouter>
   );
}
