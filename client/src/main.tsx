import { createRoot } from 'react-dom/client'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import App from './App.tsx'

import "./styles/styles.css";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!)
.render(
   <QueryClientProvider client={queryClient}>
      <App />
   </QueryClientProvider>
)
