import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Registro from './pages/auth/Registro';
import ListaEscritorios from './pages/escritorios/ListaEscritorios';
import DetalleEscritorio from './pages/escritorios/DetalleEscritorio';
import MisReservas from './pages/reservas/MisReservas';
import Dashboard from './pages/admin/Dashboard';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return estaAutenticado ? children : <Navigate to="/login" />;
};

// Componente para rutas públicas (login/registro)
const PublicRoute = ({ children }) => {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return !estaAutenticado ? children : <Navigate to="/escritorios" />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/registro"
          element={
            <PublicRoute>
              <Registro />
            </PublicRoute>
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/escritorios"
          element={
            <ProtectedRoute>
              <ListaEscritorios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/escritorios/:id"
          element={
            <ProtectedRoute>
              <DetalleEscritorio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute>
              <MisReservas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;