import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { ThemeProvider } from './components/ThemeProvider';
import { Menu } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <HashRouter>
        <div className="flex min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-sans transition-colors">
          <Sidebar 
            onOpenNewLead={() => {}} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          
          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[hsl(var(--background))]/80 backdrop-blur-md border-b border-[hsl(var(--border))] z-30 flex items-center px-4 justify-between">
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setIsSidebarOpen(true)}
                 className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg text-[hsl(var(--foreground))] opacity-70 hover:opacity-100 transition-colors"
               >
                 <Menu size={20} />
               </button>
               <span className="font-bold text-[hsl(var(--foreground))] text-lg">Evoc Labs</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center text-[hsl(var(--accent-foreground))] text-xs font-bold">
               EL
             </div>
          </div>
          
          <main className="flex-1 w-full lg:ml-64 min-h-screen pt-16 lg:pt-0 transition-all duration-300">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
