import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ArticlesPage from "@/pages/ArticlesPage";
import AirdropsPage from "@/pages/AirdropsPage";
import AirdropDetailPage from "@/pages/AirdropDetailPage";
import MarketIndicesPage from "@/pages/MarketIndicesPage";
import AdminPage from "@/pages/AdminPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";

function App() {
  return (
    <div className="App min-h-screen bg-gray-950">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/airdrops" element={<AirdropsPage />} />
          <Route path="/airdrops/:airdropId" element={<AirdropDetailPage />} />
          <Route path="/indices" element={<MarketIndicesPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <Footer />
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;