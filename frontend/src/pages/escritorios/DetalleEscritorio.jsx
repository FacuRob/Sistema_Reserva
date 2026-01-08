import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import escritorioService from '../../services/escritorioService';
import reservaService from '../../services/reservaService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const DetalleEscritorio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [escritorio, setEscritorio] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '09:00',
    horaFin: '10:00',
  });

  useEffect(() => {
    cargarDatos();
  }, [id, formData.fecha]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [escritorioData, disponibilidadData] = await Promise.all([
        escritorioService.obtenerPorId(id),
        escritorioService.obtenerDisponibilidad(id, formData.fecha),
      ]);
      setEscritorio(escritorioData.escritorio);
      setReservas(disponibilidadData.reservas);
    } catch (err) {
      setError(err.error || 'Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const validarHorario = () => {
    if (formData.horaInicio >= formData.horaFin) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
      return false;
    }

    // Verificar solapamiento con reservas existentes
    for (const reserva of reservas) {
      const inicioReserva = reserva.start_time.substring(0, 5);
      const finReserva = reserva.end_time.substring(0, 5);

      const haySolapamiento =
        (formData.horaInicio < finReserva && formData.horaFin > inicioReserva) ||
        (formData.horaInicio >= inicioReserva && formData.horaInicio < finReserva) ||
        (formData.horaFin > inicioReserva && formData.horaFin <= finReserva);

      if (haySolapamiento) {
        setError(
          `El horario se solapa con una reserva existente (${inicioReserva} - ${finReserva})`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validarHorario()) {
      return;
    }

    setEnviando(true);

    try {
      await reservaService.crear({
        escritorio_id: parseInt(id),
        reserva_date: formData.fecha,
        start_time: formData.horaInicio,
        end_time: formData.horaFin,
      });
      setSuccess('¡Reserva creada exitosamente!');
      setTimeout(() => {
        navigate('/mis-reservas');
      }, 2000);
    } catch (err) {
      setError(err.error || 'Error al crear reserva');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!escritorio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Escritorio no encontrado</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        variant="outline"
        onClick={() => navigate('/escritorios')}
        className="mb-6"
      >
        ← Volver
      </Button>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Información del escritorio */}
        <Card title="Información del Escritorio">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {escritorio.nombre}
              </h2>
              <p className="text-gray-600 mt-1">
                📍 {escritorio.localidad || 'Sin ubicación'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Descripción</h3>
              <p className="text-gray-600">
                {escritorio.descripcion || 'Sin descripción disponible'}
              </p>
            </div>

            <div>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  escritorio.disponible
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {escritorio.disponible ? '✓ Disponible' : '✗ No disponible'}
              </span>
            </div>
          </div>
        </Card>

        {/* Formulario de reserva */}
        <Card title="Hacer una Reserva">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <Input
              label="Fecha"
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />

            <Input
              label="Hora de Inicio"
              type="time"
              name="horaInicio"
              value={formData.horaInicio}
              onChange={handleChange}
              required
            />

            <Input
              label="Hora de Fin"
              type="time"
              name="horaFin"
              value={formData.horaFin}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              disabled={enviando || !escritorio.disponible}
              fullWidth
            >
              {enviando ? 'Creando reserva...' : 'Reservar'}
            </Button>
          </form>
        </Card>
      </div>

      {/* Reservas existentes */}
      <Card title="Reservas del Día Seleccionado" className="mt-6">
        {reservas.length === 0 ? (
          <p className="text-gray-600">No hay reservas para esta fecha</p>
        ) : (
          <div className="space-y-2">
            {reservas.map((reserva, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">
                  {reserva.start_time.substring(0, 5)} - {reserva.end_time.substring(0, 5)}
                </span>
                <span className="text-red-600 font-medium">Ocupado</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DetalleEscritorio;