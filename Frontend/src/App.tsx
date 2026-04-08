import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import MainTool from "./components/MainTool";

import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<MainTool />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="faq" element={<FAQ />} />
      </Route>
    </Routes>
  );
}
