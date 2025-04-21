//Simular y almacenar datos de un sistema físico (como un tanque con bomba y botones) para:
//Verificar que la base de datos funciona correctamente.
//Probar una conexión con un frontend.
//simula temporalmente la lectura desde un PLC mientras se desarrolla el sistema.

require('dotenv').config(); // Cargar variables de entorno desde .env

// Importar las bibliotecas necesarias para el servidor y la conexión
const express = require('express'); // Framework para crear el servidor
const mongoose = require('mongoose'); // Biblioteca para interactuar con MongoDB
const cors = require('cors');

// Crear una aplicación Express
const app = express();
const PORT = process.env.PORT || 5000; // Definir el puerto del servidor

app.use(cors());
app.use(express.json());

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

// Definir el esquema de datos para MongoDB
const dataSchema = new mongoose.Schema({
  hora: String, // Hora de la lectura
  referencia_nivel_tanque_cm: Number, // Referencia del nivel del tanque
  nivel_actual_tanque_cm: Number, // Nivel actual del tanque
  rpms_bomba: Number, // RPMs de la bomba
  estado_boton_start: Number, // Estado del botón de inicio
  estado_boton_stop: Number, // Estado del botón de parada
  estado_boton_paro_emergencia: Number, // Estado del botón de paro de emergencia
}, { versionKey: false }); // Desactivar el campo __v

// Crear un modelo de datos basado en el esquema para la base de datos en la nube
const DataModel = mongoose.model('Datos_monitoreo', dataSchema);

// Crear un modelo de datos para la base de datos local
const LocalDataModel = localConnection.model('datos_monitoreo_local', dataSchema);

// Definir el esquema de datos para el setpoint
const setpointSchema = new mongoose.Schema({
  hora: String, // Hora de la lectura
  referencia_nivel_tanque_cm: Number, // Referencia del nivel del tanque
  origen: String, // Para identificar si viene del frontend o Python
}, { versionKey: false }); // Desactivar el campo __v

// Crear un modelo de datos para el setpoint
const SetpointModel = mongoose.model('Setpoint', setpointSchema);

// Definir el esquema de datos para los estados de los botones
const botonesSchema = new mongoose.Schema({
  hora: String,
  estado_boton_start: Number,
  estado_boton_stop: Number,
  estado_boton_paro_emergencia: Number,
}, { versionKey: false });

// Crear modelos para los estados de los botones
const BotonesModel = mongoose.model('Estados_botones', botonesSchema);
const BotonesLocalModel = localConnection.model('estados_botones_local', botonesSchema);

// Función para obtener el último setpoint
async function getLatestSetpoint() {
  try {
    const latestSetpoint = await SetpointModel.findOne().sort({ _id: -1 });
    return latestSetpoint ? latestSetpoint.referencia_nivel_tanque_cm : 100; // valor por defecto 100
  } catch (error) {
    console.error('Error al obtener el último setpoint:', error);
    return 100; // valor por defecto en caso de error
  }
}

// Simular datos y almacenarlos en MongoDB
let previousData = {};
let count = 0;
let randomData = [];

// Generar 10 datos aleatorios
for (let i = 0; i < 10; i++) {
  randomData.push({
    hora: new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' }),
    nivel_actual_tanque_cm: Math.floor(Math.random() * 100),
    rpms_bomba: Math.floor(Math.random() * 500),
    estado_boton_start: Math.round(Math.random()),
    estado_boton_stop: Math.round(Math.random()),
    estado_boton_paro_emergencia: Math.round(Math.random()),
  });
}

setInterval(async () => {
  const currentSetpoint = await getLatestSetpoint();
  
  const simulatedData = count < 10 ? 
    { 
      ...randomData[count], 
      referencia_nivel_tanque_cm: currentSetpoint,
      estado_boton_start: previousData.estado_boton_start || 0,
      estado_boton_stop: previousData.estado_boton_stop || 0,
      estado_boton_paro_emergencia: previousData.estado_boton_paro_emergencia || 0
    } : 
    { 
      ...randomData[9], 
      hora: new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' }),
      referencia_nivel_tanque_cm: currentSetpoint,
      estado_boton_start: previousData.estado_boton_start || 0,
      estado_boton_stop: previousData.estado_boton_stop || 0,
      estado_boton_paro_emergencia: previousData.estado_boton_paro_emergencia || 0
    };

  const hasChanged = Object.keys(simulatedData).some(
    key => key !== 'hora' && simulatedData[key] !== previousData[key]
  );

  if (hasChanged) {
    try {
      // Guardar en la base de datos en la nube
      const data = new DataModel(simulatedData);
      await data.save();
      
      // Guardar en la base de datos local
      const localData = new LocalDataModel(simulatedData);
      await localData.save();
      
      console.log('Datos guardados en ambas bases de datos:', simulatedData);
      previousData = simulatedData;
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  } else {
    // Sobrescribir el último documento si no ha cambiado en ambas bases de datos
    await DataModel.findOneAndUpdate({}, simulatedData, { sort: { _id: -1 } });
    await LocalDataModel.findOneAndUpdate({}, simulatedData, { sort: { _id: -1 } });
    console.log('Datos sobrescritos en ambas bases de datos:', simulatedData);
  }

  count++;

  // Limpiar los primeros 100 documentos cada 500 iteraciones en ambas bases de datos
  if (count % 500 === 0) {
    await DataModel.deleteMany().sort({ _id: 1 }).limit(100);
    await LocalDataModel.deleteMany().sort({ _id: 1 }).limit(100);
    console.log('Limpiados los primeros 100 documentos en ambas bases de datos');
  }

}, 1000); // Simular cada segundo

// Endpoint para obtener los últimos datos
app.get('/api/data', async (req, res) => {
  try {
    const latestData = await DataModel.findOne().sort({ _id: -1 });
    res.json(latestData);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Endpoint para actualizar el setpoint desde el frontend
app.post('/api/setpoint', async (req, res) => {
  try {
    const { referencia_nivel_tanque_cm } = req.body;
    
    const newSetpoint = new SetpointModel({
      hora: new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' }),
      referencia_nivel_tanque_cm: referencia_nivel_tanque_cm,
      origen: 'frontend'
    });
    
    await newSetpoint.save();
    res.json({ success: true, setpoint: newSetpoint });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el setpoint' });
  }
});

// Endpoint para obtener el último setpoint
app.get('/api/setpoint', async (req, res) => {
  try {
    const latestSetpoint = await SetpointModel.findOne().sort({ _id: -1 });
    res.json(latestSetpoint);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el setpoint' });
  }
});

// Endpoint para actualizar los estados de los botones
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

    // Guardar en ambas bases de datos
    const botones = new BotonesModel(botonesData);
    await botones.save();

    const botonesLocal = new BotonesLocalModel(botonesData);
    await botonesLocal.save();

    // Actualizar los estados en previousData para la simulación
    previousData = { ...previousData, ...botonesData };
    
    res.json({ success: true, botones: botonesData });
  } catch (error) {
    console.error('Error al actualizar los estados de los botones:', error);
    res.status(500).json({ error: 'Error al actualizar los estados de los botones' });
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

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); // Confirmar que el servidor está activo
}); 