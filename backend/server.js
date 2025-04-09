const express = require('express');
const mongoose = require('mongoose');
const snap7 = require('node-snap7');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// PLC connection
const plc = new snap7.S7Client();
plc.ConnectTo('192.168.0.1', 0, 1, (err) => {
  if (err) {
    return console.error('PLC connection failed:', err);
  }
  console.log('Connected to PLC');

  // Read PLC data
  setInterval(() => {
    plc.MBRead(20, 1, (err, res) => {
      if (err) {
        return console.error('Read error:', err);
      }
      const value = res.readUInt8(0);
      console.log('Marca:', value);

      // Save to MongoDB
      const data = new DataModel({ value });
      data.save((err) => {
        if (err) {
          return console.error('Save error:', err);
        }
        console.log('Data saved to MongoDB');
      });
    });
  }, 500);
});

// Data model
const dataSchema = new mongoose.Schema({
  value: Number,
  timestamp: { type: Date, default: Date.now },
});

const DataModel = mongoose.model('Data', dataSchema);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 