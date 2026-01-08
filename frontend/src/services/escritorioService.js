import api from './api';

const escritorioService = {
  obtenerTodos: async () => {
    try {
      const response = await api.get('/escritorios');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener escritorios' };
    }
  },

  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/escritorios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener escritorio' };
    }
  },

  crear: async (datos) => {
    try {
      const response = await api.post('/escritorios', datos);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al crear escritorio' };
    }
  },

  actualizar: async (id, datos) => {
    try {
      const response = await api.put(`/escritorios/${id}`, datos);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al actualizar escritorio' };
    }
  },

  eliminar: async (id) => {
    try {
      const response = await api.delete(`/escritorios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al eliminar escritorio' };
    }
  },

  obtenerDisponibilidad: async (id, fecha) => {
    try {
      const response = await api.get(`/escritorios/${id}/disponibilidad`, {
        params: { fecha },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener disponibilidad' };
    }
  },
};

export default escritorioService;