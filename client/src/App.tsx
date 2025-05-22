import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import AuthRoutesWrapper from "./components/auth/AuthRoutesWrapper";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import MainLayout from "./components/MainLayout";
import ProfilePage from "./components/profile/ProfilePage";
import HomePage from "./components/HomePage";
import NotFoundPage from "./components/NotFoundPage";
import UserRoutesWrapper from "./components/auth/UserRoutesWrapper";
import ChatbotWrapper from "./components/chatbot/ChatbotWrapper";
import LanguageProvider from "./components/language/LanguageProvider";
import About from "./components/about/About";
import ProfileReportPage from "./components/profile/ProfileReportPage";
import AdminPage from "./components/admin/AdminPage";
import ChatProvider from "./components/chatbot/ChatProvider";
import CommunityPage from "./components/community/CommunityPage";
import CommunityReportPage from "./components/community/CommunityReportPage";
import ErrorPage from "./components/ErrorPage";
import AdminRoutesWrapper from "./components/admin/AdminRoutesWrapper";
import AdminReportPage from "./components/admin/AdminReportPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
   return (
      <QueryClientProvider client={queryClient}>
         <BrowserRouter>
            <Toaster />
            <ErrorBoundary fallback={<ErrorPage />}>
               <LanguageProvider>
                  <ChatProvider>
                     <Routes>

                        <Route element={<MainLayout />}>

                           <Route element={<UserRoutesWrapper />}>

                              <Route path="/chatbot/:currChatId?" element={<ChatbotWrapper />} />

                              <Route path="/profile">

                                 <Route index element={<ProfilePage />} />

                                 <Route path=":reportId" element={<ProfileReportPage />} />

                              </Route>

                              <Route path="/community">

                                 <Route index element={<CommunityPage />} />

                                 <Route path=":reportId" element={<CommunityReportPage />} />

                              </Route>

                           </Route>

                           <Route path="/auth" element={<AuthRoutesWrapper />}>

                              <Route index element={<Login />} />

                              <Route path="reg" element={<Register />} />

                           </Route>

                           <Route path="/admin" element={<AdminRoutesWrapper />}>

                              <Route index element={<AdminPage />} />

                              <Route path="report/:reportId" element={<AdminReportPage />} />

                           </Route>

                           <Route index element={<HomePage />} />

                           <Route path="/about" element={<About />} />

                           <Route path="*" element={<NotFoundPage />} />

                        </Route>

                     </Routes>
                  </ChatProvider>
               </LanguageProvider>
            </ErrorBoundary>
         </BrowserRouter>
      </QueryClientProvider>
   );
}
