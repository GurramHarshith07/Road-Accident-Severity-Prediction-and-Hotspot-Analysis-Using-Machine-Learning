import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Car, Brain, MapPin, BarChart3,
  Upload, FlaskConical, FileText, Info, AlertTriangle, Menu, X
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import AccidentRecords from './pages/AccidentRecords';
import SeverityPrediction from './pages/SeverityPrediction';
import AccidentHotspots from './pages/AccidentHotspots';
import DataAnalytics from './pages/DataAnalytics';
import DatasetUpload from './pages/DatasetUpload';
import ModelEvaluation from './pages/ModelEvaluation';
import Reports from './pages/Reports';
import About from './pages/About';

const NAV = [
  { to: '/',              label: 'Dashboard',         Icon: LayoutDashboard },
  { to: '/accidents',     label: 'Accident Records',  Icon: Car },
  { to: '/prediction',    label: 'Severity Prediction', Icon: Brain },
  { to: '/hotspots',      label: 'Accident Hotspots', Icon: MapPin },
  { to: '/analytics',     label: 'Data Analytics',    Icon: BarChart3 },
  { to: '/upload',        label: 'Dataset Upload',    Icon: Upload },
  { to: '/models',        label: 'Model Evaluation',  Icon: FlaskConical },
  { to: '/reports',       label: 'Reports',           Icon: FileText },
  { to: '/about',         label: 'About Project',     Icon: Info },
];

function Sidebar({ open, setOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        bg-[#152233] text-white transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">Road Accident</div>
            <div className="text-[10px] text-slate-400">Safety Analytics</div>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <div className="text-xs text-slate-500">B.Tech Final Year Project</div>
          <div className="text-xs text-slate-600 mt-0.5">AI/ML & Data Science</div>
        </div>
      </aside>
    </>
  );
}

function Header({ setOpen }) {
  const location = useLocation();
  const currentPage = NAV.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  );

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
      <button
        className="lg:hidden text-slate-500 hover:text-slate-700"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>
      <div>
        <h1 className="font-semibold text-slate-800 text-base">
          {currentPage?.label || 'Road Accident Analytics'}
        </h1>
        <p className="text-xs text-slate-500">Road Accident Severity Prediction & Hotspot Analysis</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-xs text-slate-500 hidden sm:block">System Online</span>
      </div>
    </header>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header setOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/accidents/*" element={<AccidentRecords />} />
              <Route path="/prediction" element={<SeverityPrediction />} />
              <Route path="/hotspots" element={<AccidentHotspots />} />
              <Route path="/analytics" element={<DataAnalytics />} />
              <Route path="/upload" element={<DatasetUpload />} />
              <Route path="/models" element={<ModelEvaluation />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
