import requests
from datetime import datetime
import pytz
import sys
import random
import time

def update_setpoint(nuevo_valor=None):
    # URL del servidor
    url = 'http://localhost:5000/api/setpoint'
    
    # Si no se proporciona un valor, generar uno aleatorio entre 0 y 100
    if nuevo_valor is None:
        nuevo_valor = float(input('Ingrese el nuevo valor para el setpoint (0-100 cm): '))
    
    # Validar el rango
    if not (0 <= nuevo_valor <= 100):
        print(f'Error: El valor debe estar entre 0 y 100 cm. Valor proporcionado: {nuevo_valor}')
        return False

    # Obtener la hora actual en Colombia
    tz_co = pytz.timezone('America/Bogota')
    hora_actual = datetime.now(tz_co).strftime('%I:%M:%S %p')
    
    # Datos a enviar
    data = {
        'referencia_nivel_tanque_cm': nuevo_valor,
        'hora': hora_actual,
    }
    
    try:
        # Enviar la solicitud POST
        response = requests.post(url, json=data)
        
        if response.status_code == 200:
            print(f'✅ Setpoint actualizado exitosamente a {nuevo_valor} cm')
            print('Respuesta del servidor:', response.json())
            return True
        else:
            print(f'❌ Error al actualizar el setpoint. Código de estado: {response.status_code}')
            print('Respuesta del servidor:', response.text)
            return False
            
    except requests.exceptions.RequestException as e:
        print(f'❌ Error de conexión: {e}')
        return False

def get_current_setpoint():
    url = 'http://localhost:5000/api/setpoint'
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return data.get('referencia_nivel_tanque_cm')
    except:
        return None

if __name__ == '__main__':
    try:
        # Obtener el setpoint actual
        current_setpoint = get_current_setpoint()
        if current_setpoint is not None:
            print(f'Setpoint actual: {current_setpoint} cm')
        
        # Si se proporciona un argumento, usarlo como nuevo valor
        if len(sys.argv) > 1:
            try:
                nuevo_valor = float(sys.argv[1])
                update_setpoint(nuevo_valor)
            except ValueError:
                print('Error: El valor proporcionado no es un número válido')
        else:
            # Si no hay argumento, solicitar el valor
            update_setpoint()
            
    except KeyboardInterrupt:
        print('\nOperación cancelada por el usuario')
    except Exception as e:
        print(f'Error inesperado: {e}') 