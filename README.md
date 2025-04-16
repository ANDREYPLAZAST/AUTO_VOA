# Sistema de Supervisión Tanque

Sistema de monitoreo y control para tanque de agua con interfaz web en tiempo real.

## Estructura Actual del Proyecto

```
AUTO_VOA/
│
├── backend/                      # Carpeta del servidor
│   ├── node_modules/            # Dependencias instaladas de Node.js
│   ├── server.js                # Archivo principal del servidor
│   ├── .env                     # Variables de entorno (MongoDB URI)
│   ├── package.json             # Configuración y dependencias del backend
│   └── package-lock.json        # Versiones exactas de dependencias
│
├── frontend/                     # Carpeta del cliente web
│   ├── node_modules/            # Dependencias instaladas de React
│   ├── public/                  # Archivos públicos
│   ├── src/                     # Código fuente del frontend
│   │   ├── components/          # Componentes React
│   │   │   ├── DataTable.jsx    # Tabla de datos en tiempo real
│   │   │   ├── EstadoBotones.jsx# Control de botones Start/Stop
│   │   │   ├── NivelTanque.jsx  # Visualización del tanque
│   │   │   └── SetpointControl.jsx# Control de setpoint
│   │   ├── App.jsx             # Componente principal
│   │   └── main.jsx            # Punto de entrada
│   ├── index.html              # HTML principal
│   ├── package.json            # Configuración y dependencias del frontend
│   └── package-lock.json       # Versiones exactas de dependencias
│
├── update_setpoint.py           # Script Python para actualizar setpoint
├── requirements.txt             # Dependencias de Python
├── .gitignore                  # Archivos ignorados por Git
└── README.md                   # Este archivo

```

## Descripción Detallada de Componentes

### Backend (Node.js + Express)

#### Dependencias Principales (package.json)
- `express`: Framework web para Node.js
- `mongoose`: ODM para MongoDB
- `cors`: Middleware para habilitar CORS
- `dotenv`: Manejo de variables de entorno

#### Archivos Clave
- `server.js`: 
  - Configuración del servidor Express
  - Conexión a MongoDB
  - Definición de modelos de datos (DataSchema, SetpointSchema)
  - Endpoints API:
    * GET /api/data
    * POST /api/setpoint
    * GET /api/setpoint

- `.env`:
  ```
  MONGODB_URI=tu_uri_de_mongodb
  PORT=5000
  ```

### Frontend (React + Vite)

#### Dependencias Principales (package.json)
- `react`: Biblioteca UI
- `@mui/material`: Componentes Material-UI
- `axios`: Cliente HTTP
- `vite`: Bundler y servidor de desarrollo

#### Componentes React
1. **SetpointControl.jsx**
   - Input numérico y slider (0-100)
   - Validación de rango
   - Comunicación con API
   - Feedback visual

2. **NivelTanque.jsx**
   - Visualización gráfica del nivel
   - Actualización en tiempo real
   - Indicador de porcentaje

3. **EstadoBotones.jsx**
   - Botones Start/Stop/Emergencia
   - Estados visuales
   - Manejo de eventos

4. **DataTable.jsx**
   - Tabla de datos actual
   - Actualización automática
   - Formato de datos

### Script Python (update_setpoint.py)

#### Dependencias (requirements.txt)
- `requests`: Para llamadas HTTP
- `pytz`: Manejo de zonas horarias

#### Funcionalidades
- Actualización manual del setpoint
- Validación de rango (0-100)
- Manejo de errores
- Feedback en consola

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
```
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/basedatos
PORT=5000
```

### Frontend
- `VITE_API_URL`: URL del backend (por defecto: http://localhost:5000)

## Características Principales

1. **Monitoreo en Tiempo Real**
   - Nivel del tanque
   - RPMs de la bomba
   - Estados de botones
   - Setpoint actual

2. **Control de Sistema**
   - Ajuste de setpoint (0-100 cm)
   - Control de bomba (Start/Stop)
   - Paro de emergencia
   - Validación de datos

3. **Interfaz de Usuario**
   - Diseño responsivo
   - Tema oscuro
   - Feedback visual
   - Actualizaciones en tiempo real

4. **Seguridad y Validación**
   - Validación de datos
   - Manejo de errores
   - Límites de valores

## Notas de Desarrollo

- El frontend se actualiza cada segundo para datos en tiempo real
- Los datos se almacenan en MongoDB con timestamps
- El script Python puede usarse como alternativa al control web
- Todos los valores están limitados y validados

## Mantenimiento

- Los logs se limpian automáticamente
- La base de datos mantiene historial limitado
- El frontend maneja reconexiones automáticas
- Backups automáticos en MongoDB Atlas 