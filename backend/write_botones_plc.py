import snap7
import json
import sys
from snap7.util import set_bool

def write_botones_to_plc():
    try:
        # Obtener los datos de los argumentos
        datos_botones = json.loads(sys.argv[1])
        
        # Conectar al PLC
        plc = snap7.client.Client()
        plc.connect('192.168.0.1', 0, 1)  # IP, rack, slot
        
        # Leer el bloque de datos actual (DB5)
        db_number = 5
        start_offset = 0
        size = 1
        db_data = plc.db_read(db_number, start_offset, size)
        
        # Escribir los estados de los botones
        # START en DB5.DBX0.0
        set_bool(db_data, 0, 0, datos_botones['start'])
        
        # STOP en DB5.DBX0.1
        set_bool(db_data, 0, 1, datos_botones['stop'])
        
        # PARO DE EMERGENCIA en DB5.DBX0.2
        set_bool(db_data, 0, 2, datos_botones['emergencia'])
        
        # Escribir el byte modificado de vuelta al PLC
        plc.db_write(db_number, start_offset, db_data)
        
        # Desconectar del PLC
        plc.disconnect()
        
        # Retornar éxito
        print(json.dumps({
            'success': True,
            'message': 'Estados de botones escritos correctamente en el PLC',
            'estados': {
                'start': datos_botones['start'],
                'stop': datos_botones['stop'],
                'emergencia': datos_botones['emergencia']
            }
        }))
        
    except Exception as e:
        # En caso de error, retornar el error
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))

if __name__ == '__main__':
    write_botones_to_plc() 