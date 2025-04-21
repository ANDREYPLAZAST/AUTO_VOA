import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NivelTanque from './components/NivelTanque';
import DataTable from './components/DataTable';
import SetpointControl from './components/SetpointControl';
import BotonesControl from './components/BotonesControl';
import { CircularProgress, Alert, Snackbar, Box } from '@mui/material';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/data`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        setData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1a1a1a',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1600px',
          mx: 'auto',
          px: 4,
          py: 4
        }}
      >
        <h1 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          margin: '0 0 3rem 0',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          Sistema de Supervisión Tanque
        </h1>

        {/* Tabla de Datos */}
        <Box sx={{ 
          width: '100%',
          bgcolor: 'rgba(32, 32, 32, 0.95)',
          borderRadius: 1,
          overflow: 'auto',
          mb: 6
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : !error && data ? (
            <DataTable data={data} />
          ) : null}
        </Box>

        {/* Panel Principal */}
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          alignItems: 'center',
          mb: 4
        }}>
          {/* Panel Izquierdo - Setpoint */}
          <Box sx={{ 
            width: '400px',
            bgcolor: 'rgba(32, 32, 32, 0.95)',
            borderRadius: 2,
            p: 4
          }}>
            <SetpointControl />
          </Box>

          {/* Panel Central - Botones y Tanque */}
          <Box sx={{ 
            flex: '0 1 800px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Box sx={{ width: '100%', mb: 8 }}>
              <BotonesControl />
            </Box>
            <Box sx={{ transform: 'scale(1.4)' }}>
              <NivelTanque nivel={data?.nivel_actual_tanque_cm} />
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;