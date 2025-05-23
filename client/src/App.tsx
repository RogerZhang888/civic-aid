import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AdminRoutesWrapper from "./components/admin/AdminRoutesWrapper";
import AuthRoutesWrapper from "./components/auth/AuthRoutesWrapper";
import UserRoutesWrapper from "./components/auth/UserRoutesWrapper";
import ChatbotWrapper from "./components/chatbot/ChatbotWrapper";
import LanguageProvider from "./components/language/LanguageProvider";
import MainLayout from "./components/MainLayout";
import ChatProvider from "./components/chatbot/ChatProvider";
import ErrorPage from "./components/ErrorPage";
import GenericLoading from "./components/GenericLoading";

const Login = lazy(() => import("./components/auth/Login"));
const Register = lazy(() => import("./components/auth/Register"));
const ProfilePage = lazy(() => import("./components/profile/ProfilePage"));
const HomePage = lazy(() => import("./components/HomePage"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
const About = lazy(() => import("./components/about/About"));
const ReportPage = lazy(() => import("./components/profile/ReportPage"));
const AdminDashboardPage = lazy(() => import("./components/admin/AdminDashboardPage"));
const CommunityPage = lazy(() => import("./components/community/CommunityPage"));
const AdminReportPage = lazy(() => import("./components/admin/AdminReportPage"));
const AdminSummaryPage = lazy(() => import("./components/admin/AdminSummaryPage"));

const queryClient = new QueryClient();

export default function App() {
   return (
      <QueryClientProvider client={queryClient}>
         <BrowserRouter>
            <Toaster />
            <ErrorBoundary fallback={<ErrorPage />}>
               <LanguageProvider>
                  <ChatProvider>
                     <MainLayout>
                        <Suspense fallback={<GenericLoading str="Loading interface..."/>}>
                           <Routes>

                              <Route element={<UserRoutesWrapper />}>

                                 <Route path="/chatbot/:currChatId?" element={<ChatbotWrapper />} />

                                 <Route path="/profile">

                                    <Route index element={<ProfilePage />} />

                                    <Route path=":reportId" element={<ReportPage type="profile"/>}/>

                                 </Route>

                                 <Route path="/community">

                                    <Route index element={<CommunityPage />} />

                                    <Route path=":reportId" element={<ReportPage type="community"/>} />

                                 </Route>

                              </Route>

                              <Route path="/auth" element={<AuthRoutesWrapper />}>

                                 <Route index element={<Login />} />

                                 <Route path="reg" element={<Register />} />

                              </Route>

                              <Route path="/admin" element={<AdminRoutesWrapper />}>

                                 <Route index element={<AdminDashboardPage />} />

                                 <Route path="summary" element={<AdminSummaryPage />} />

                                 <Route path="report/:reportId" element={<AdminReportPage />} />

                              </Route>

                              <Route index element={<HomePage />} />

                              <Route path="/about" element={<About />} />

                              <Route path="*" element={<NotFoundPage />} />

                           </Routes>
                        </Suspense>
                     </MainLayout>
                  </ChatProvider>
               </LanguageProvider>
            </ErrorBoundary>
         </BrowserRouter>
      </QueryClientProvider>
   );
}
