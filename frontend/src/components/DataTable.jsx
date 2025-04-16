import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

const DataTable = ({ data }) => {
  return (
    <TableContainer 
      component={Paper} 
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        '& .MuiTableCell-root': {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          padding: '16px',
        }
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell 
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '1rem',
              }}
            >
              Hora
            </TableCell>
            <TableCell 
              align="center"
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '1rem',
              }}
            >
              Nivel Actual (cm)
            </TableCell>
            <TableCell 
              align="center"
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '1rem',
              }}
            >
              RPMs Bomba
            </TableCell>
            <TableCell 
              align="center"
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '1rem',
              }}
            >
              Estado Botón Start
            </TableCell>
            <TableCell 
              align="center"
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '1rem',
              }}
            >
              Estado Botón Stop
            </TableCell>
            <TableCell 
              align="center"
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '1rem',
              }}
            >
              Estado Botón Paro Emergencia
            </TableCell>
            <TableCell 
              align="center"
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '1rem',
              }}
            >
              Referencia Nivel (cm)
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow
            sx={{
              '&:last-child td, &:last-child th': { border: 0 },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <TableCell>{data.hora}</TableCell>
            <TableCell align="center">{data.nivel_actual_tanque_cm}</TableCell>
            <TableCell align="center">{data.rpms_bomba}</TableCell>
            <TableCell align="center">
              <span style={{
                color: data.estado_boton_start ? '#4caf50' : '#f44336',
                fontWeight: 'bold'
              }}>
                {data.estado_boton_start ? 'Activo' : 'Inactivo'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span style={{
                color: data.estado_boton_stop ? '#4caf50' : '#f44336',
                fontWeight: 'bold'
              }}>
                {data.estado_boton_stop ? 'Activo' : 'Inactivo'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span style={{
                color: data.estado_boton_paro_emergencia ? '#4caf50' : '#f44336',
                fontWeight: 'bold'
              }}>
                {data.estado_boton_paro_emergencia ? 'Activado' : 'Inactivo'}
              </span>
            </TableCell>
            <TableCell align="center">{data.referencia_nivel_tanque_cm}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;