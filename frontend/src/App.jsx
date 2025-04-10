import React, { useEffect, useState } from 'react';
import { checkConnection } from './services/api';
import axios from 'axios';
import './App.css';
import DataTable from './components/DataTable'; // Importa el componente de tabla

function App() {
  const [status, setStatus] = useState('Conectando...');
  const [data, setData] = useState(null);

  useEffect(() => {
    checkConnection()
      .then(() => setStatus('Backend y Frontend Conectados'))
      .catch(() => setStatus('Error al conectar con el Backend'));

    const fetchData = async () => {
      try {
        const response = await axios.get('/api/data');
        setData(response.data);
        console.log('Datos obtenidos:', response.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    const interval = setInterval(() => {
      fetchData();
    }, 1000); // Actualiza cada segundo

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>{status}</h1>
      {data ? (
        <DataTable data={data} /> // Usa el componente de tabla
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
}

export default App;
