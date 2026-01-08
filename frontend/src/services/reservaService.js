import api from './api';

const reservaService = {
  crear: async (datos) => {
    try {
      const response = await api.post('/reservas', datos);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al crear reserva' };
    }
  },

  obtenerTodas: async (filtros = {}) => {
    try {
      const response = await api.get('/reservas', { params: filtros });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener reservas' };
    }
  },

  obtenerMisReservas: async () => {
    try {
      const response = await api.get('/reservas/mis-reservas');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener mis reservas' };
    }
  },

  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/reservas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener reserva' };
    }
  },

  actualizar: async (id, datos) => {
    try {
      const response = await api.put(`/reservas/${id}`, datos);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al actualizar reserva' };
    }
  },

  cancelar: async (id) => {
    try {
      const response = await api.patch(`/reservas/${id}/cancelar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al cancelar reserva' };
    }
  },

  eliminar: async (id) => {
    try {
      const response = await api.delete(`/reservas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al eliminar reserva' };
    }
  },
};

export default reservaService;