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

// Conexión a MongoDB usando la URI del entorno
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Manejo de la conexión a la base de datos
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:')); // Manejar errores de conexión
db.once('open', () => {
  console.log('Conectado a MongoDB'); // Confirmar conexión exitosa
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

// Crear un modelo de datos basado en el esquema
const DataModel = mongoose.model('Datos_monitoreo', dataSchema);

// Definir el esquema de datos para el setpoint
const setpointSchema = new mongoose.Schema({
  hora: String, // Hora de la lectura
  referencia_nivel_tanque_cm: Number, // Referencia del nivel del tanque
  origen: String, // Para identificar si viene del frontend o Python
}, { versionKey: false }); // Desactivar el campo __v

// Crear un modelo de datos para el setpoint
const SetpointModel = mongoose.model('Setpoint', setpointSchema);

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
    { ...randomData[count], referencia_nivel_tanque_cm: currentSetpoint } : 
    { 
      ...randomData[9], 
      hora: new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' }),
      referencia_nivel_tanque_cm: currentSetpoint
    };

  const hasChanged = Object.keys(simulatedData).some(
    key => key !== 'hora' && simulatedData[key] !== previousData[key]
  );

  if (hasChanged) {
    try {
      const data = new DataModel(simulatedData);
      await data.save();
      console.log('Datos guardados en MongoDB:', simulatedData);
      previousData = simulatedData;
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  } else {
    // Sobrescribir el último documento si no ha cambiado
    await DataModel.findOneAndUpdate({}, simulatedData, { sort: { _id: -1 } });
    console.log('Datos sobrescritos en MongoDB:', simulatedData);
  }

  count++;

  // Limpiar los primeros 100 documentos cada 500 iteraciones
  if (count % 500 === 0) {
    await DataModel.deleteMany().sort({ _id: 1 }).limit(100);
    console.log('Limpiados los primeros 100 documentos');
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

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); // Confirmar que el servidor está activo
}); 