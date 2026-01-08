import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const Home = () => {
  const { estaAutenticado } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Bienvenido a Coworking Express
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Reserva escritorios de forma simple y rápida. Encuentra el espacio perfecto para trabajar.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            {estaAutenticado ? (
              <Link to="/escritorios">
                <Button className="text-lg px-8 py-3">
                  Ver Escritorios Disponibles
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/registro">
                  <Button className="text-lg px-8 py-3">
                    Comenzar Ahora
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="text-lg px-8 py-3">
                    Iniciar Sesión
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Reserva Fácil</h3>
              <p className="text-gray-600">
                Sistema simple de reservas por hora. Elige tu escritorio y horario.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold mb-2">Disponibilidad en Tiempo Real</h3>
              <p className="text-gray-600">
                Consulta la disponibilidad de escritorios en tiempo real.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">Gestión Simple</h3>
              <p className="text-gray-600">
                Administra tus reservas de forma intuitiva y eficiente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;