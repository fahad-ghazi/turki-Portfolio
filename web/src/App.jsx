import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';

import PageNotFound from './lib/PageNotFound';
import Home from './pages/Home';
import AiFashion from './pages/AiFashion';
import CommercialAds from './pages/CommercialAds';
import RealEstate from './pages/RealEstate';
import Heritage from './pages/Heritage';
import Films from './pages/Films';
import Contact from './pages/Contact';
import CV from './pages/CV';
import Booking from './pages/Booking';
import TrainedModels from './pages/TrainedModels';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <Routes>
              {/* Public site — renders immediately, never waits on the admin auth check */}
              <Route path="/" element={<Home />} />
              <Route path="/ai-fashion" element={<AiFashion />} />
              <Route path="/commercial-ads" element={<CommercialAds />} />
              <Route path="/real-estate" element={<RealEstate />} />
              <Route path="/heritage" element={<Heritage />} />
              <Route path="/films" element={<Films />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cv" element={<CV />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/trained-models" element={<TrainedModels />} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
