// Importar las bibliotecas necesarias para el servidor y la conexión
const express = require('express'); // Framework para crear el servidor
const mongoose = require('mongoose'); // Biblioteca para interactuar con MongoDB
const snap7 = require('node-snap7'); // Biblioteca para comunicarse con PLCs

// Crear una aplicación Express
const app = express();
const PORT = process.env.PORT || 5000; // Definir el puerto del servidor

// Conexión a MongoDB usando la URI del entorno
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true, // Usar el nuevo analizador de URL
  useUnifiedTopology: true, // Usar la nueva topología de servidor
});

// Manejo de la conexión a la base de datos
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:')); // Manejar errores de conexión
db.once('open', () => {
  console.log('Conectado a MongoDB'); // Confirmar conexión exitosa
});

// Crear una instancia del cliente PLC
const plc = new snap7.S7Client();
plc.ConnectTo('192.168.0.1', 0, 1, (err) => { // Conectar al PLC
  if (err) {
    return console.error('Error de conexión al PLC:', err); // Manejar errores de conexión
  }
  console.log('Conectado al PLC'); // Confirmar conexión exitosa

  // Leer datos del PLC cada 500 ms
  setInterval(() => {
    plc.MBRead(20, 1, (err, res) => { // Leer 1 byte desde la dirección M20
      if (err) {
        return console.error('Error de lectura:', err); // Manejar errores de lectura
      }
      const value = res.readUInt8(0); // Obtener el valor del byte leído
      console.log('Marca:', value); // Imprimir el valor leído

      // Crear un nuevo documento con el valor leído
      const data = new DataModel({ value });
      data.save((err) => { // Guardar el documento en MongoDB
        if (err) {
          return console.error('Error al guardar:', err); // Manejar errores al guardar
        }
        console.log('Datos guardados en MongoDB'); // Confirmar guardado exitoso
      });
    });
  }, 500);
});

// Definir el esquema de datos para MongoDB
const dataSchema = new mongoose.Schema({
  value: Number, // Valor leído del PLC
  timestamp: { type: Date, default: Date.now }, // Marca de tiempo automática
});

// Crear un modelo de datos basado en el esquema
const DataModel = mongoose.model('Data', dataSchema);

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); // Confirmar que el servidor está activo
}); 