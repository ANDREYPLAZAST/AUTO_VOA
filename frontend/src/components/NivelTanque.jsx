// frontend/src/components/NivelTanque.jsx
import React from 'react';

function NivelTanque({ nivel }) {
  const porcentaje = Math.max(0, Math.min(100, nivel)); // Asegura que esté entre 0 y 100

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 80,
          height: 200,
          border: '4px solid #aaa',
          borderRadius: 20,
          background: '#222',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 10
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: `${porcentaje}%`,
            background: 'linear-gradient(to top, #00bfff, #66e0ff)',
            transition: 'height 0.5s'
          }} />
        </div>
      </div>
      <span style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>{porcentaje} %</span>
    </div>
  );
}

export default NivelTanque;