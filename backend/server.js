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
// CONEXIÓN A MONGODB
// ====================================================

// Establece la conexión con MongoDB usando la URI del archivo .env
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Configuración de manejadores de eventos para la conexión a MongoDB
const db = mongoose.connection;
// Manejador de errores de conexión
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
// Manejador de conexión exitosa
db.once('open', () => {
  console.log('Conexión exitosa a MongoDB');
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

// Crea el modelo para los datos de monitoreo
const DataModel = mongoose.model('Datos_monitoreo', dataSchema);

// Esquema para los setpoints (valores de referencia)
// Define la estructura de los datos que se guardarán en la colección 'Setpoint'
const setpointSchema = new mongoose.Schema({
  hora: String, // Hora en que se estableció el setpoint
  referencia_nivel_tanque_cm: Number, // Valor del setpoint en centímetros
  origen: String // Origen del setpoint ('PLC' o 'frontend')
}, { versionKey: false });

// Crea el modelo para los setpoints
const SetpointModel = mongoose.model('Setpoint', setpointSchema);

// Esquema para los estados de los botones
const botonesSchema = new mongoose.Schema({
  hora: String,
  estado_boton_start: Number,
  estado_boton_stop: Number,
  estado_boton_paro_emergencia: Number
}, { versionKey: false });

// Crea el modelo para los estados de los botones
const BotonesModel = mongoose.model('Estados_botones', botonesSchema);

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

// Función para escribir el estado de los botones en el PLC
async function writeBotonesEstadoToPLC(estados) {
  try {
    // Convertir valores numéricos a booleanos para el PLC
    const plcData = {
      start: estados.estado_boton_start === 1,
      stop: estados.estado_boton_stop === 1,
      emergencia: estados.estado_boton_paro_emergencia === 1
    };

    // Ejecutar script Python para escribir en el PLC (versión de prueba)
    const results = await PythonShell.run('write_botones_plc_prueba.py', {
      args: [JSON.stringify(plcData)]
    });

    const plcResult = JSON.parse(results[0]);
    if (!plcResult.success) {
      throw new Error(`Error al escribir en el PLC: ${plcResult.error}`);
    }

    return plcResult;
  } catch (error) {
    console.error('Error escribiendo estados de botones al PLC:', error);
    throw error;
  }
}

// ====================================================
// LECTURA PERIÓDICA DEL PLC Y ESCRITURA DE ESTADOS
// ====================================================

let ultimosEstadosBotones = {
  estado_boton_start: 0,
  estado_boton_stop: 0,
  estado_boton_paro_emergencia: 0
};

// Variable para mantener el último dato guardado
let ultimoDatoGuardado = null;

// Configura un intervalo que se ejecuta cada segundo (100ms)
setInterval(async () => {
  try {
    // Obtener último estado de botones de la base de datos
    const ultimoEstadoDB = await BotonesModel.findOne().sort({ _id: -1 });
    
    if (ultimoEstadoDB) {
      // Verificar si hay cambios en los estados
      const hayCambios = 
        ultimoEstadoDB.estado_boton_start !== ultimosEstadosBotones.estado_boton_start ||
        ultimoEstadoDB.estado_boton_stop !== ultimosEstadosBotones.estado_boton_stop ||
        ultimoEstadoDB.estado_boton_paro_emergencia !== ultimosEstadosBotones.estado_boton_paro_emergencia;

      // Si hay cambios, escribir al PLC
      if (hayCambios) {
        console.log('Cambios detectados en estados de botones, escribiendo al PLC...');
        await writeBotonesEstadoToPLC(ultimoEstadoDB);
        // Actualizar estados guardados
        ultimosEstadosBotones = {
          estado_boton_start: ultimoEstadoDB.estado_boton_start,
          estado_boton_stop: ultimoEstadoDB.estado_boton_stop,
          estado_boton_paro_emergencia: ultimoEstadoDB.estado_boton_paro_emergencia
        };
      }
    }

    // Ejecuta el script Python que lee los datos del PLC (versión de prueba)
    const results = await PythonShell.run('read_plc_prueba.py', null);
    // Parsea los datos recibidos del PLC
    const plcData = JSON.parse(results[0]);
    
    // Obtiene la hora actual en formato de Bogotá
    const hora = new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' });

    // Prepara los datos para guardar, combinando la hora con los datos del PLC
    const dataToSave = {
      hora,
      ...plcData
    };

    // Verificar si hay cambios en los datos
    const hayCambiosEnDatos = !ultimoDatoGuardado || 
      Object.keys(plcData).some(key => 
        key !== 'hora' && plcData[key] !== ultimoDatoGuardado[key]
      );

    if (hayCambiosEnDatos) {
      // Guarda los datos de monitoreo en MongoDB
      const data = new DataModel(dataToSave);
      await data.save();
      console.log('Datos guardados (cambios detectados):', dataToSave);
      ultimoDatoGuardado = plcData;
    } else {
      // Sobrescribir el último documento si no ha cambiado
      await DataModel.findOneAndUpdate({}, dataToSave, { sort: { _id: -1 } });
      console.log('Datos sobrescritos (sin cambios):', dataToSave);
    }

    // Si el botón de confirmar está activado (valor 1), guarda un nuevo setpoint
    if (plcData.estado_boton_confirmar === 1) {
      const setpoint = new SetpointModel({
        hora,
        referencia_nivel_tanque_cm: plcData.referencia_nivel_tanque_cm,
        origen: 'PLC'
      });
      await setpoint.save();
      console.log('Setpoint guardado:', setpoint);
    }

  } catch (err) {
    console.error('Error en el ciclo de lectura/escritura:', err);
  }
}, 100);

// ====================================================
// ENDPOINTS DE LA API
// ====================================================

// Endpoint para obtener el último dato de monitoreo
app.get('/api/data', async (req, res) => {
  try {
    // Busca el documento más reciente en la colección de datos
    const latestData = await DataModel.findOne().sort({ _id: -1 });
    res.json(latestData);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Endpoint para obtener el último setpoint
app.get('/api/setpoint', async (req, res) => {
  try {
    // Busca el setpoint más reciente
    const latestSetpoint = await SetpointModel.findOne().sort({ _id: -1 });
    res.json(latestSetpoint);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el setpoint' });
  }
});

// Endpoint para establecer un nuevo setpoint desde el frontend
app.post('/api/setpoint', async (req, res) => {
  try {
    const { referencia_nivel_tanque_cm } = req.body;
    const hora = new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' });

    // Escribir el nuevo valor en el PLC (versión de prueba)
    const results = await PythonShell.run('write_plc_prueba.py', { 
      args: [JSON.stringify({ setpoint: referencia_nivel_tanque_cm })]
    });

    const plcResult = JSON.parse(results[0]);
    if (!plcResult.success) {
      throw new Error(`Error al escribir en el PLC: ${plcResult.error}`);
    }

    // Guardar el nuevo setpoint en la base de datos
    const newSetpoint = new SetpointModel({
      hora,
      referencia_nivel_tanque_cm,
      origen: 'frontend'
    });
    const savedSetpoint = await newSetpoint.save();

    res.json({ 
      success: true, 
      setpoint: savedSetpoint,
      plcResult
    });
  } catch (error) {
    console.error('Error en el endpoint setpoint:', error);
    res.status(500).json({ 
      error: 'Error al guardar setpoint',
      details: error.message 
    });
  }
});

// Endpoint para actualizar el estado de los botones
app.post('/api/botones', async (req, res) => {
  try {
    const { estado_boton_start, estado_boton_stop, estado_boton_paro_emergencia } = req.body;
    const hora = new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' });

    // Crear el nuevo estado de botones
    const botonesData = {
      hora,
      estado_boton_start: estado_boton_start || 0,
      estado_boton_stop: estado_boton_stop || 0,
      estado_boton_paro_emergencia: estado_boton_paro_emergencia || 0
    };

    // Escribir inmediatamente al PLC
    const plcResult = await writeBotonesEstadoToPLC(botonesData);

    // Guardar en la base de datos
    const botones = new BotonesModel(botonesData);
    const savedBotones = await botones.save();

    res.json({ 
      success: true, 
      botones: savedBotones,
      plcResult
    });
  } catch (error) {
    console.error('Error al actualizar los estados de los botones:', error);
    res.status(500).json({ 
      error: 'Error al actualizar los estados de los botones',
      details: error.message
    });
  }
});

// Endpoint para obtener el último estado de los botones
app.get('/api/botones', async (req, res) => {
  try {
    const ultimoEstado = await BotonesModel.findOne().sort({ _id: -1 });
    res.json(ultimoEstado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los estados de los botones' });
  }
});

// ====================================================
// INICIO DEL SERVIDOR
// ====================================================

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
