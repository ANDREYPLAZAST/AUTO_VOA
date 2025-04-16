# Sistema de Supervisión Tanque

Sistema de monitoreo y control para tanque de agua con interfaz web en tiempo real.

## Estructura del Proyecto

```
AUTO_VOA/
│
├── backend/                      # Servidor Node.js
│   ├── node_modules/            # Dependencias instaladas
│   ├── server.js                # Servidor Express + MongoDB
│   ├── .env                     # Variables de entorno
│   └── package.json             # Configuración del proyecto
│
├── frontend/                     # Cliente React + Vite
│   ├── src/                     # Código fuente
│   │   ├── components/          # Componentes React
│   │   │   ├── DataTable.jsx    # Tabla de datos en tiempo real
│   │   │   ├── EstadoBotones.jsx# Control de botones Start/Stop
│   │   │   ├── NivelTanque.jsx  # Visualización del tanque
│   │   │   └── SetpointControl.jsx# Control de setpoint
│   │   └── App.jsx             # Componente principal
│   └── index.html              # HTML principal
│
└── update_setpoint.py           # Script Python para setpoint
```

## Tecnologías Utilizadas

### Backend
- **Node.js + Express**: Servidor web moderno y rápido
- **MongoDB**: Base de datos para almacenar datos históricos y configuraciones
- **Mongoose**: Para modelado de datos y conexión con MongoDB
- **API RESTful**: Endpoints para datos y control
  - GET /api/data: Obtiene datos actuales
  - POST /api/setpoint: Actualiza setpoint
  - GET /api/setpoint: Consulta setpoint
  - POST /api/control: Control de bomba

### Frontend
- **React 18**: Biblioteca UI moderna y reactiva
- **Vite**: Bundler y servidor de desarrollo ultrarrápido
- **Material-UI**: Componentes visuales profesionales
- **Fetch API**: Para comunicación con el backend

## Configuración del Proyecto

### Backend
```bash
cd backend
npm install
# Crear archivo .env con MONGODB_URI
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Script Python
```bash
pip install -r requirements.txt
python update_setpoint.py [valor]
```

## Variables de Entorno

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/basedatos
PORT=5000
```

### Frontend
- `VITE_API_URL`: URL del backend (por defecto: http://localhost:5000)

## Componentes Principales

### DataTable
- Muestra datos en tiempo real
- Actualización automática cada segundo
- Visualización de nivel, RPM y estado

### NivelTanque
- Representación visual del tanque
- Marcadores de nivel cada 10%
- Animaciones suaves de cambio

### EstadoBotones
- Control START/STOP del sistema
- Botón de emergencia
- Estados visuales (ON/OFF/EMERGENCY)

### SetpointControl
- Slider para ajuste de nivel (0-100)
- Validación de rango
- Botón de confirmación

## Características del Sistema

### Monitoreo en Tiempo Real
- Nivel del tanque
- RPMs de la bomba
- Estados de botones
- Setpoint actual

### Control de Sistema
- Ajuste de setpoint (0-100 cm)
- Control de bomba (Start/Stop)
- Paro de emergencia
- Validación de datos

### Interfaz de Usuario
- Diseño responsivo
- Tema oscuro
- Feedback visual
- Actualizaciones en tiempo real

### Seguridad y Validación
- Validación de datos
- Manejo de errores
- Límites de valores
- Protección contra valores inválidos

### Script Python
- Herramienta CLI para setpoint
- Validación de valores
- Manejo de errores
- Uso: `python update_setpoint.py [valor]`