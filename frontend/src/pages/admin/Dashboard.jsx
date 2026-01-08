import { useState, useEffect } from 'react';
import escritorioService from '../../services/escritorioService';
import reservaService from '../../services/reservaService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Dashboard = () => {
  const [escritorios, setEscritorios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    localidad: '',
    disponible: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [escritoriosData, reservasData] = await Promise.all([
        escritorioService.obtenerTodos(),
        reservaService.obtenerTodas(),
      ]);
      setEscritorios(escritoriosData.escritorios);
      setReservas(reservasData.reservas);
    } catch (err) {
      setError(err.error || 'Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  const resetFormulario = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      localidad: '',
      disponible: true,
    });
    setEditando(null);
    setMostrarFormulario(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editando) {
        await escritorioService.actualizar(editando, formData);
        setSuccess('Escritorio actualizado exitosamente');
      } else {
        await escritorioService.crear(formData);
        setSuccess('Escritorio creado exitosamente');
      }
      await cargarDatos();
      resetFormulario();
    } catch (err) {
      setError(err.error || 'Error al guardar escritorio');
    }
  };

  const handleEditar = (escritorio) => {
    setFormData({
      nombre: escritorio.nombre,
      descripcion: escritorio.descripcion || '',
      localidad: escritorio.localidad || '',
      disponible: escritorio.disponible,
    });
    setEditando(escritorio.id);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este escritorio? Se eliminarán también todas sus reservas.')) {
      return;
    }

    try {
      await escritorioService.eliminar(id);
      setSuccess('Escritorio eliminado exitosamente');
      await cargarDatos();
    } catch (err) {
      setError(err.error || 'Error al eliminar escritorio');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando panel...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="mt-2 text-gray-600">Gestiona escritorios y visualiza reservas</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">{escritorios.length}</div>
            <div className="text-gray-600 mt-2">Total Escritorios</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">
              {escritorios.filter((e) => e.disponible).length}
            </div>
            <div className="text-gray-600 mt-2">Disponibles</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">
              {reservas.filter((r) => r.estado === 'confirmed').length}
            </div>
            <div className="text-gray-600 mt-2">Reservas Activas</div>
          </div>
        </Card>
      </div>

      {/* Gestión de Escritorios */}
      <Card title="Gestión de Escritorios" className="mb-8">
        <div className="mb-4">
          <Button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            variant={mostrarFormulario ? 'secondary' : 'primary'}
          >
            {mostrarFormulario ? 'Cancelar' : '+ Nuevo Escritorio'}
          </Button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editando ? 'Editar Escritorio' : 'Nuevo Escritorio'}
            </h3>

            <Input
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Escritorio 1"
              required
            />

            <Input
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción del escritorio"
            />

            <Input
              label="Localidad"
              name="localidad"
              value={formData.localidad}
              onChange={handleChange}
              placeholder="Ej: Piso 1 - Zona A"
            />

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="disponible"
                  checked={formData.disponible}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm font-medium text-gray-700">Disponible</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editando ? 'Actualizar' : 'Crear'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetFormulario}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {escritorios.map((escritorio) => (
            <div
              key={escritorio.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{escritorio.nombre}</h4>
                <p className="text-sm text-gray-600">
                  📍 {escritorio.localidad || 'Sin ubicación'}
                </p>
                <span
                  className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                    escritorio.disponible
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {escritorio.disponible ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEditar(escritorio)}>
                  Editar
                </Button>
                <Button variant="danger" onClick={() => handleEliminar(escritorio.id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Lista de Todas las Reservas */}
      <Card title="Todas las Reservas">
        {reservas.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay reservas registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Escritorio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Horario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservas.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reserva.nombre} {reserva.apellido}
                      </div>
                      <div className="text-sm text-gray-500">{reserva.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {reserva.escritorio_nombre}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatearFecha(reserva.reserva_date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {reserva.start_time.substring(0, 5)} - {reserva.end_time.substring(0, 5)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reserva.estado === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {reserva.estado === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;