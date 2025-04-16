# Sistema de Supervisión Tanque

Este proyecto implementa un sistema de monitoreo y control para un tanque de agua, con una interfaz web moderna y un backend robusto.

## Estructura del Proyecto

```
├── backend/
│   ├── server.js                 # Servidor principal
│   └── .env                      # Variables de entorno (MongoDB URI)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DataTable.jsx     # Tabla de datos en tiempo real
│   │   │   ├── EstadoBotones.jsx # Componente de botones de control
│   │   │   ├── NivelTanque.jsx   # Visualización del nivel del tanque
│   │   │   └── SetpointControl.jsx# Control del setpoint
│   │   ├── App.jsx               # Componente principal
│   │   └── main.jsx              # Punto de entrada de React
│   ├── index.html                # HTML principal
│   └── package.json              # Dependencias del frontend
├── update_setpoint.py            # Script para actualizar setpoint


## Descripción de Componentes

### Backend (Node.js + Express + MongoDB)

- **server.js**:
  - Configuración del servidor Express
  - Conexión a MongoDB
  - Definición de esquemas de datos
  - Endpoints API:
    - GET /api/data: Obtiene último dato monitoreado
    - POST /api/setpoint: Actualiza el setpoint
    - GET /api/setpoint: Obtiene el último setpoint

### Frontend (React + Material-UI)

- **App.jsx**:
  - Componente principal
  - Manejo del estado global
  - Layout y estructura de la interfaz
  - Actualización en tiempo real

- **SetpointControl.jsx**:
  - Control numérico y slider para setpoint
  - Validación de rango (0-100)
  - Botón de confirmación
  - Feedback visual de actualizaciones

- **NivelTanque.jsx**:
  - Visualización gráfica del nivel del tanque
  - Actualización en tiempo real
  - Indicador de porcentaje

- **EstadoBotones.jsx**:
  - Botones de Start, Stop y Paro de Emergencia
  - Indicadores visuales de estado
  - Feedback de acciones

- **DataTable.jsx**:
  - Tabla de datos en tiempo real
  - Muestra último registro
  - Formato de datos y estados

### Scripts Auxiliares

- **update_setpoint.py**:
  - Script independiente para modificar setpoint
  - Uso por línea de comandos
  - Validación de valores
  - Feedback de operaciones

## Tecnologías Utilizadas

- **Backend**:
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - CORS

- **Frontend**:
  - React
  - Material-UI
  - Axios
  - Vite

- **Utilidades**:
  - Python (script de setpoint)
  - Requests (librería Python)
  - PyTZ (zonas horarias)

## Funcionalidades Principales

1. **Monitoreo en Tiempo Real**:
   - Nivel del tanque
   - RPMs de la bomba
   - Estados de botones
   - Setpoint actual

2. **Control de Setpoint**:
   - Interfaz gráfica (slider)
   - Input numérico
   - Validación de rango
   - Confirmación de cambios

3. **Visualización de Datos**:
   - Tabla de datos actual
   - Indicadores visuales
   - Estados de botones
   - Timestamps

4. **Seguridad y Validación**:
   - Validación de datos
   - Manejo de errores
   - Feedback de operaciones
   - Límites de valores

## Configuración Necesaria

1. **Backend**:
   ```bash
   cd backend
   npm install
   # Crear archivo .env con MONGODB_URI
   npm start
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Script Python**:
   ```bash
   pip install -r requirements.txt
   python update_setpoint.py [valor]
   ``` 