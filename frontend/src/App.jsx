import { Route, Routes } from "react-router-dom";
import FloatingBackground from "./components/FloatingBackground.jsx";
import Sidebar from "./components/Sidebar.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import SummaryPage from "./pages/SummaryPage.jsx";
import RiskPage from "./pages/RiskPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <FloatingBackground />
      <div className="mx-auto flex max-w-7xl gap-6 p-6">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-10">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/risks" element={<RiskPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
