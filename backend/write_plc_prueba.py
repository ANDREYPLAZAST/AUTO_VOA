import json
import sys
import os

def simular_escritura_setpoint():
    try:
        # Leer el setpoint de los argumentos
        datos = json.loads(sys.argv[1])
        setpoint = datos.get('setpoint', 0)
        
        # Guardar datos para monitoreo
        with open('monitor_setpoint.json', 'w') as f:
            json.dump({'setpoint': setpoint}, f)
        
        # Simular escritura exitosa
        print(json.dumps({
            'success': True,
            'message': f'Setpoint {setpoint} escrito correctamente en el PLC',
            'valor_escrito': setpoint
        }))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))

if __name__ == '__main__':
    simular_escritura_setpoint() 