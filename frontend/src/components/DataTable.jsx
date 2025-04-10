import React from 'react';

function DataTable({ data }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Hora</th>
          <th>Nivel Actual (cm)</th>
          <th>RPMs Bomba</th>
          <th>Estado Botón Start</th>
          <th>Estado Botón Stop</th>
          <th>Estado Botón Paro Emergencia</th>
          <th>Referencia Nivel (cm)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{data.hora}</td>
          <td>{data.nivel_actual_tanque_cm}</td>
          <td>{data.rpms_bomba}</td>
          <td>{data.estado_boton_start}</td>
          <td>{data.estado_boton_stop}</td>
          <td>{data.estado_boton_paro_emergencia}</td>
          <td>{data.referencia_nivel_tanque_cm}</td>
        </tr>
      </tbody>
    </table>
  );
}

export default DataTable;