import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EstadoBotones from './components/EstadoBotones';
import NivelTanque from './components/NivelTanque';
import DataTable from './components/DataTable';
import SetpointControl from './components/SetpointControl';
import { CircularProgress, Alert, Snackbar, Container, Box } from '@mui/material';

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
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1a1a1a',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <Container 
        maxWidth={false}
        disableGutters
        sx={{ 
          flex: 1,
          py: 4,
          px: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            width: '100%',
          }}
        >
          <h1 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            margin: 0,
            marginBottom: '2rem',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Sistema de Supervisión Tanque
          </h1>

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 8,
            width: '100%',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              width: { xs: '100%', md: '45%' },
              maxWidth: '500px'
            }}>
              <SetpointControl />
              <EstadoBotones
                start={data?.estado_boton_start}
                stop={data?.estado_boton_stop}
                paroEmergencia={data?.estado_boton_paro_emergencia}
              />
            </Box>

            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              width: { xs: '100%', md: '45%' },
              maxWidth: '500px'
            }}>
              <NivelTanque nivel={data?.nivel_actual_tanque_cm} />
            </Box>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          {!loading && !error && data && (
            <Box sx={{ 
              width: '100%',
              mt: 6,
              px: { xs: 0, sm: 2, md: 4 },
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                },
              },
            }}>
              <DataTable data={data} />
            </Box>
          )}
        </Box>
      </Container>

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