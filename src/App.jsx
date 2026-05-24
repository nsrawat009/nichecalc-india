import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import MoonlightingCalc from './pages/MoonlightingCalc';
import FreelancerCalc from './pages/FreelancerCalc';
import EvPetrolCalc from './pages/EvPetrolCalc';
import EsopCalc from './pages/EsopCalc';
import NriPropertyCalc from './pages/NriPropertyCalc';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="moonlighting-tax-calculator-india" element={<MoonlightingCalc />} />
            <Route path="freelancer-tax-calculator-india" element={<FreelancerCalc />} />
            <Route path="ev-vs-petrol-cost-calculator-india" element={<EvPetrolCalc />} />
            <Route path="esop-tax-calculator-india-unlisted-startup" element={<EsopCalc />} />
            <Route path="nri-property-sale-capital-gains-calculator-india" element={<NriPropertyCalc />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
