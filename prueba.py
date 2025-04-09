import snap7
from snap7.util import *
import time

# Conexión con el PLC
plc = snap7.client.Client()
plc.connect('192.168.0.1', 0, 1)
print('Conectado')

# Lectura periódica
while True:
    time.sleep(0.5)
    
    # Leer byte de marcas
    marca = plc.mb_read(20, 1)  # Lee 1 byte desde la dirección 20
    marca = get_byte(marca, 0)  # Obtiene el valor del byte leído
    print('Marca:', marca) 