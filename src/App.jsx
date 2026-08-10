import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import RoutePlanner from './pages/RoutePlanner.jsx';
import RouteResults from './pages/RouteResults.jsx';
import RouteDetail from './pages/RouteDetail.jsx';
import SensoryRefuges from './pages/SensoryRefuges.jsx';
import Forecast from './pages/Forecast.jsx';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<RoutePlanner />} />
        <Route path="/routes" element={<RouteResults />} />
        <Route path="/routes/:routeId" element={<RouteDetail />} />
        <Route path="/refuges" element={<SensoryRefuges />} />
        <Route path="/forecast" element={<Forecast />} />
      </Routes>
    </AppShell>
  );
}
