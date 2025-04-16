// ====================================================
// CONFIGURACIÓN INICIAL Y DEPENDENCIAS
// ===================================================
// Carga las variables de entorno desde el archivo .env
// Esto permite usar variables como MONGODB_URI y PORT de forma segura
require('dotenv').config();

// Importación de las dependencias necesarias
const express = require('express'); // Framework web para Node.js
const mongoose = require('mongoose'); // ODM (Object Document Mapper) para MongoDB
const cors = require('cors'); // Middleware para habilitar CORS (Cross-Origin Resource Sharing)
const { PythonShell } = require('python-shell'); // Para ejecutar scripts de Python

// ====================================================
// CONFIGURACIÓN DEL SERVIDOR EXPRESS
// ====================================================

// Creación de la aplicación Express
const app = express();
// Puerto en el que correrá el servidor, usa el de .env o 5000 por defecto
const PORT = process.env.PORT || 5000;

// Configuración de middlewares
app.use(cors()); // Habilita CORS para permitir peticiones desde otros dominios
app.use(express.json()); // Permite parsear el cuerpo de las peticiones como JSON

// ====================================================
// CONEXIÓN A MONGODB (NUBE Y LOCAL)
// ====================================================

// Conexión a MongoDB en la nube
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB en la nube'))
  .catch(err => console.error('Error de conexión a MongoDB en la nube:', err));

// Conexión a MongoDB local
const localMongoUri = process.env.MONGODB_LOCAL_URI;
const localConnection = mongoose.createConnection(localMongoUri);

localConnection.on('error', console.error.bind(console, 'Error de conexión a MongoDB local:'));
localConnection.once('open', () => {
  console.log('Conectado a MongoDB local');
});

// ====================================================
// ESQUEMAS DE MONGODB
// ====================================================

// Esquema para los datos de monitoreo del PLC
// Define la estructura de los datos que se guardarán en la colección 'Datos_monitoreo'
const dataSchema = new mongoose.Schema({
  hora: String, // Hora de la medición en formato de Bogotá
  referencia_nivel_tanque_cm: Number, // Nivel de referencia deseado del tanque en centímetros
  nivel_actual_tanque_cm: Number, // Nivel actual medido del tanque en centímetros
  rpms_bomba: Number, // Velocidad de rotación de la bomba en RPM
  estado_boton_start: Number, // Estado del botón de inicio (0 = inactivo, 1 = activo)
  estado_boton_stop: Number, // Estado del botón de parada (0 = inactivo, 1 = activo)
  estado_boton_paro_emergencia: Number, // Estado del botón de paro de emergencia (0 = inactivo, 1 = activo)
  estado_boton_confirmar: Number // Estado del botón de confirmación (0 = inactivo, 1 = activo)
}, { versionKey: false }); // Desactiva el campo __v de versionado de documentos

// Modelos para la base de datos en la nube
const DataModel = mongoose.model('Datos_monitoreo', dataSchema);

// Modelos para la base de datos local
const LocalDataModel = localConnection.model('datos_monitoreo_local', dataSchema);

// Esquema para los setpoints (valores de referencia)
// Define la estructura de los datos que se guardarán en la colección 'Setpoint'
const setpointSchema = new mongoose.Schema({
  hora: String, // Hora en que se estableció el setpoint
  referencia_nivel_tanque_cm: Number, // Valor del setpoint en centímetros
  origen: String // Origen del setpoint ('PLC' o 'frontend')
}, { versionKey: false });

// Crea el modelo para los setpoints
const SetpointModel = mongoose.model('Setpoint', setpointSchema);

// Modelos para la base de datos local
const LocalSetpointModel = localConnection.model('setpoint_local', setpointSchema);

// ====================================================
// FUNCIONES AUXILIARES
// ====================================================

// Función para obtener el último setpoint guardado
// Retorna el valor del último setpoint o 100 si no hay setpoints
async function getLatestSetpoint() {
  try {
    const latest = await SetpointModel.findOne().sort({ _id: -1 });
    return latest ? latest.referencia_nivel_tanque_cm : 100;
  } catch (e) {
    console.error('Error obteniendo el último setpoint:', e);
    return 100;
  }
}

// ====================================================
// LECTURA PERIÓDICA DEL PLC
// ====================================================

// Configura un intervalo que se ejecuta cada segundo (1000ms)
setInterval(() => {
  // Ejecuta el script Python que lee los datos del PLC
  PythonShell.run('read_plc.py', null).then(async (results) => {
    // Parsea los datos recibidos del PLC
    const plcData = JSON.parse(results[0]);
    
    // Obtiene la hora actual en formato de Bogotá
    const hora = new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' });

    // Prepara los datos para guardar, combinando la hora con los datos del PLC
    const dataToSave = {
      hora,
      ...plcData
    };

    try {
      // Guarda los datos de monitoreo en MongoDB
      const data = new DataModel(dataToSave);
      await data.save();
      
      // Guardar en la base de datos local
      const localData = new LocalDataModel(dataToSave);
      await localData.save();
      
      console.log('Datos guardados en ambas bases de datos:', dataToSave);

      // Si el botón de confirmar está activado (valor 1), guarda un nuevo setpoint
      if (plcData.estado_boton_confirmar === 1) {
        const setpointData = {
          hora,
          referencia_nivel_tanque_cm: plcData.referencia_nivel_tanque_cm,
          origen: 'PLC' // Indica que el setpoint viene del PLC
        };

        // Guardar setpoint en la nube
        const setpoint = new SetpointModel(setpointData);
        await setpoint.save();

        // Guardar setpoint en local
        const localSetpoint = new LocalSetpointModel(setpointData);
        await localSetpoint.save();

        console.log('Setpoint guardado en ambas bases de datos:', setpointData);
      }
    } catch (err) {
      console.error('Error al guardar en las bases de datos:', err);
    }

  }).catch((err) => {
    console.error('Error al ejecutar el script Python:', err);
  });
}, 1000);

// ====================================================
// ENDPOINTS DE LA API
// ====================================================

// Endpoint para obtener el último dato de monitoreo
app.get('/api/data', async (req, res) => {
  try {
    // Busca el documento más reciente en la colección de datos
    const latestData = await DataModel.findOne().sort({ _id: -1 });
    const latestLocalData = await LocalDataModel.findOne().sort({ _id: -1 });
    res.json({
      cloud: latestData,
      local: latestLocalData
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Endpoint para obtener el último setpoint
app.get('/api/setpoint', async (req, res) => {
  try {
    // Busca el setpoint más reciente
    const latestSetpoint = await SetpointModel.findOne().sort({ _id: -1 });
    const latestLocalSetpoint = await LocalSetpointModel.findOne().sort({ _id: -1 });
    res.json({
      cloud: latestSetpoint,
      local: latestLocalSetpoint
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el setpoint' });
  }
});

// Endpoint para establecer un nuevo setpoint desde el frontend
app.post('/api/setpoint', async (req, res) => {
  try {
    // Extrae el valor del setpoint del cuerpo de la petición
    const { referencia_nivel_tanque_cm } = req.body;
    
    // Obtiene la hora actual en formato de Bogotá
    const hora = new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' });

    // Escribir el nuevo valor en el PLC
    PythonShell.run('write_plc.py', { args: [referencia_nivel_tanque_cm] }).then(async (results) => {
      const plcResult = JSON.parse(results[0]);
      
      if (!plcResult.success) {
        throw new Error(`Error al escribir en el PLC: ${plcResult.error}`);
      }

      const setpointData = {
        hora,
        referencia_nivel_tanque_cm,
        origen: 'frontend' // Indica que el setpoint viene del frontend
      };

      // Guardar en la nube
      const newSetpoint = new SetpointModel(setpointData);
      const savedCloudSetpoint = await newSetpoint.save();

      // Guardar en local
      const newLocalSetpoint = new LocalSetpointModel(setpointData);
      const savedLocalSetpoint = await newLocalSetpoint.save();

      res.json({ 
        success: true, 
        setpoint: {
          cloud: savedCloudSetpoint,
          local: savedLocalSetpoint
        },
        plcResult: plcResult
      });
    }).catch((error) => {
      throw error;
    });

  } catch (error) {
    console.error('Error en el endpoint setpoint:', error);
    res.status(500).json({ 
      error: 'Error al guardar setpoint',
      details: error.message 
    });
  }
});

// ====================================================
// INICIO DEL SERVIDOR
// ====================================================

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
