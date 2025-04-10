import { Toaster } from "react-hot-toast";
import Chatbot from "./components/chatbot/Chatbot";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import Login from "./components/auth/Login";
import MainLayout from "./components/MainLayout";
import Register from "./components/auth/Register";
import { AuthLayout } from "./components/auth/AuthLayout";

export default function App() {
   return (
      <BrowserRouter>
         <AuthProvider>
            <Toaster/>
            <Routes>
               <Route element={<MainLayout/>}>

                  <Route path="/" element={<pre>filler 1</pre>} />

                  <Route path="/chatbot" element={<Chatbot />} />

                  <Route path="/profile" element={<pre>filler 2</pre>} />

                  <Route path="/auth" element={<AuthLayout/>}>
                     <Route index element={<Login/>}/>
                     <Route path="reg" element={<Register/>}/>
                  </Route>

               </Route>
            </Routes>
         </AuthProvider>
      </BrowserRouter>
   );
}
