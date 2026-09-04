import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import MainTool from "./components/MainTool";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import HowItWorksPage from "./components/hero/HowItWorksPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<MainTool />} />
        <Route path="contact" element={<Contact />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
      </Route>
    </Routes>
  );
}
