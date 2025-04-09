import { Toaster } from "react-hot-toast";
import Chatbot from "./components/Chatbot";

export default function App() {
   return (
      <div className="App">
         <Toaster/>
         <Chatbot />
      </div>
   );
}
