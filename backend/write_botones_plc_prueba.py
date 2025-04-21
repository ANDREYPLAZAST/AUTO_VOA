import json
import sys
import os

def simular_escritura_botones():
    try:
        # Leer los estados de los botones de los argumentos
        datos_botones = json.loads(sys.argv[1])
        
        # Guardar datos para monitoreo
        with open('monitor_botones.json', 'w') as f:
            json.dump(datos_botones, f)
        
        # Simular escritura exitosa
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
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))

if __name__ == '__main__':
    simular_escritura_botones() 