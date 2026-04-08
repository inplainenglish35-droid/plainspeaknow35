import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";

// TEMP pages (we’ll replace later)
function Pricing() {
  return (
    <div className="p-4 text-xl">
      Pricing Page
    </div>
  );
}

function FAQ() {
  return (
    <div className="p-4 text-xl">
      FAQ Page
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/faq" element={<FAQ />} />
    </Routes>
  );
}
