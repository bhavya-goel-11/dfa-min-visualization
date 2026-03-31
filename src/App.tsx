import { Sidebar } from './components/Sidebar';
import { MainCanvas } from './components/MainCanvas';
import { Network } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <Toaster position="top-right" />
      {/* Top Navigation Bar */}
      <header className="h-14 flex items-center px-6 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <Network className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
             AutomataLab
             <span className="text-slate-400 text-sm font-normal ml-2 tracking-wide hidden sm:inline-block">DFA Minimizer</span>
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Width 30%) */}
        <aside className="w-[30%] min-w-[320px] max-w-[400px] border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-0">
          <Sidebar />
        </aside>

        {/* Main Right Canvas (Width 70%) */}
        <main className="flex-1 bg-slate-50/50 relative overflow-hidden flex flex-col items-center justify-center">
          <MainCanvas />
        </main>
      </div>
    </div>
  );
}

export default App;
