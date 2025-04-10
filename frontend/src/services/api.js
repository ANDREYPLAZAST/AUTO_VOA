import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const checkConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/data`);
    return response.data;
  } catch (error) {
    console.error('Error al conectar con el backend:', error);
    throw new Error('Error al conectar con el backend');
  }
}; 