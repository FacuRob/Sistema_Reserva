import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import escritorioService from '../../services/escritorioService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ListaEscritorios = () => {
  const [escritorios, setEscritorios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    cargarEscritorios();
  }, []);

  const cargarEscritorios = async () => {
    try {
      setCargando(true);
      const data = await escritorioService.obtenerTodos();
      setEscritorios(data.escritorios);
    } catch (err) {
      setError(err.error || 'Error al cargar escritorios');
    } finally {
      setCargando(false);
    }
  };

  const verDetalle = (id) => {
    navigate(`/escritorios/${id}`);
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando escritorios...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Escritorios Disponibles</h1>
        <p className="mt-2 text-gray-600">
          Selecciona un escritorio para ver su disponibilidad y hacer una reserva
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {escritorios.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No hay escritorios disponibles</p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {escritorios.map((escritorio) => (
            <Card key={escritorio.id} className="hover:shadow-xl transition-shadow">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {escritorio.nombre}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    📍 {escritorio.localidad || 'Sin ubicación especificada'}
                  </p>
                </div>

                <p className="text-gray-600">
                  {escritorio.descripcion || 'Escritorio para trabajo individual'}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      escritorio.disponible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {escritorio.disponible ? '✓ Disponible' : '✗ No disponible'}
                  </span>
                </div>

                <Button
                  onClick={() => verDetalle(escritorio.id)}
                  fullWidth
                  disabled={!escritorio.disponible}
                >
                  {escritorio.disponible ? 'Ver Disponibilidad' : 'No Disponible'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaEscritorios;