# Sistema de Monitoreo y Control de Procesos

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

## Descripción General
Sistema de monitoreo y control en tiempo real que integra un PLC con una interfaz web, permitiendo la visualización y control de un proceso industrial.

## Características Principales

### 1. Monitoreo en Tiempo Real
- Lectura constante del PLC cada 100ms
- Variables monitoreadas:
  - Nivel de referencia del tanque
  - Nivel actual del tanque
  - RPMs de la bomba
  - Estados de los botones

### 2. Gestión Inteligente de Datos
- Almacenamiento optimizado:
  - Solo guarda cambios significativos
  - Actualiza el último registro si no hay cambios
  - Mantiene historial de eventos importantes

### 3. Control de Setpoints
- Dos orígenes de setpoints:
  - PLC: cuando se activa el botón de confirmar
  - Frontend: a través de la interfaz web
- Registro de hora y origen de cada setpoint

### 4. Control de Botones
- Monitoreo de estados:
  - Start
  - Stop
  - Paro de Emergencia
- Escritura inmediata al PLC
- Historial de cambios

### 5. Estructura de Base de Datos
Colecciones en MongoDB:
1. Datos_monitoreo
   - Lecturas del PLC
   - Historial de cambios
2. Setpoint
   - Valores de referencia
   - Origen de cada setpoint
3. Estados_botones
   - Historial de estados
   - Registro de cambios

### 6. Optimizaciones
- Lectura eficiente (100ms)
- Almacenamiento selectivo
- Comunicación bidireccional
- Minimización de datos duplicados

### 7. Seguridad y Robustez
- Manejo de errores
- Verificación de conexiones
- Validación de datos
- Sistema de respaldo

## Requisitos
- Node.js
- MongoDB
- Python 3.x
- snap7 (para comunicación con PLC)

## Instalación
1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   pip install -r requirements.txt
   ```
3. Configurar variables de entorno (.env)
4. Iniciar el servidor:
   ```bash
   node backend/server.js
   ```

## Uso
1. Acceder a la interfaz web
2. Monitorear variables en tiempo real
3. Controlar setpoints y botones
4. Ver historial de cambios

## Mantenimiento
- Monitorear logs del servidor
- Verificar conexión con PLC
- Revisar espacio en base de datos
- Actualizar dependencias periódicamente