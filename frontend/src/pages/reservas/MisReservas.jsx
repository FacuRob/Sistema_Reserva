import { useState, useEffect } from 'react';
import reservaService from '../../services/reservaService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setCargando(true);
      const data = await reservaService.obtenerMisReservas();
      setReservas(data.reservas);
    } catch (err) {
      setError(err.error || 'Error al cargar reservas');
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) {
      return;
    }

    try {
      await reservaService.cancelar(id);
      setReservas(
        reservas.map((r) =>
          r.id === id ? { ...r, estado: 'cancelled' } : r
        )
      );
    } catch (err) {
      alert(err.error || 'Error al cancelar reserva');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reserva permanentemente?')) {
      return;
    }

    try {
      await reservaService.eliminar(id);
      setReservas(reservas.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.error || 'Error al eliminar reserva');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando reservas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
        <p className="mt-2 text-gray-600">
          Administra tus reservas de escritorios
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {reservas.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No tienes reservas activas
            </p>
            <Button onClick={() => (window.location.href = '/escritorios')}>
              Hacer una Reserva
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservas.map((reserva) => (
            <Card key={reserva.id}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {reserva.escritorio_nombre}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reserva.estado === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {reserva.estado === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                    </span>
                  </div>

                  <div className="space-y-1 text-gray-600">
                    <p>📍 {reserva.localidad || 'Sin ubicación'}</p>
                    <p>📅 {formatearFecha(reserva.reserva_date)}</p>
                    <p>
                      🕐 {reserva.start_time.substring(0, 5)} -{' '}
                      {reserva.end_time.substring(0, 5)}
                    </p>
                  </div>
                </div>

                {reserva.estado === 'confirmed' && (
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      onClick={() => handleCancelar(reserva.id)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEliminar(reserva.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}

                {reserva.estado === 'cancelled' && (
                  <Button
                    variant="outline"
                    onClick={() => handleEliminar(reserva.id)}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisReservas;