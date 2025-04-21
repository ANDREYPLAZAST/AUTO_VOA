import json
import random
from datetime import datetime

# Lista de 10 datos predefinidos
datos_fijos = [
    {
        "referencia_nivel_tanque_cm": 20,
        "nivel_actual_tanque_cm": 18.5,
        "rpms_bomba": 1200,
        "estado_boton_start": 1,
        "estado_boton_stop": 0,
        "estado_boton_paro_emergencia": 0,
        "estado_boton_confirmar": 0
    },
    {
        "referencia_nivel_tanque_cm": 30,
        "nivel_actual_tanque_cm": 25.8,
        "rpms_bomba": 1500,
        "estado_boton_start": 1,
        "estado_boton_stop": 0,
        "estado_boton_paro_emergencia": 0,
        "estado_boton_confirmar": 1
    },
    {
        "referencia_nivel_tanque_cm": 40,
        "nivel_actual_tanque_cm": 35.2,
        "rpms_bomba": 1800,
        "estado_boton_start": 0,
        "estado_boton_stop": 1,
        "estado_boton_paro_emergencia": 0,
        "estado_boton_confirmar": 0
    },
    {
        "referencia_nivel_tanque_cm": 50,
        "nivel_actual_tanque_cm": 48.7,
        "rpms_bomba": 2100,
        "estado_boton_start": 0,
        "estado_boton_stop": 1,
        "estado_boton_paro_emergencia": 0,
        "estado_boton_confirmar": 0
    },
    {
        "referencia_nivel_tanque_cm": 60,
        "nivel_actual_tanque_cm": 55.3,
        "rpms_bomba": 2400,
        "estado_boton_start": 0,
        "estado_boton_stop": 0,
        "estado_boton_paro_emergencia": 1,
        "estado_boton_confirmar": 0
    },
    {
        "referencia_nivel_tanque_cm": 70,
        "nivel_actual_tanque_cm": 68.9,
        "rpms_bomba": 2700,
        "estado_boton_start": 0,
        "estado_boton_stop": 0,
        "estado_boton_paro_emergencia": 1,
        "estado_boton_confirmar": 0
    },
    {
        "referencia_nivel_tanque_cm": 80,
        "nivel_actual_tanque_cm": 75.4,
        "rpms_bomba": 2800,
        "estado_boton_start": 1,
        "estado_boton_stop": 0,
        "estado_boton_paro_emergencia": 0,
        "estado_boton_confirmar": 1
    },
    {
        "referencia_nivel_tanque_cm": 90,
        "nivel_actual_tanque_cm": 85.6,
        "rpms_bomba": 2900,
        "estado_boton_start": 1,
        "estado_boton_stop": 0,
        "estado_boton_paro_emergencia": 0,
        "estado_boton_confirmar": 0
    },
    {
        "referencia_nivel_tanque_cm": 95,
        "nivel_actual_tanque_cm": 92.1,
        "rpms_bomba": 3000,
        "estado_boton_start": 0,
        "estado_boton_stop": 1,
        "estado_boton_paro_emergencia": 0,
        "estado_boton_confirmar": 0
    },
    {
        "referencia_nivel_tanque_cm": 100,
        "nivel_actual_tanque_cm": 98.7,
        "rpms_bomba": 2500,
        "estado_boton_start": 0,
        "estado_boton_stop": 0,
        "estado_boton_paro_emergencia": 0,
        "estado_boton_confirmar": 1
    }
]

# Variable para mantener el índice actual
indice_actual = 0

def simular_lectura_plc():
    try:
        global indice_actual
        
        # Obtener el dato actual y actualizar el índice
        dato = datos_fijos[indice_actual]
        indice_actual = (indice_actual + 1) % 10  # Vuelve a 0 después de 9
        
        # Retornar el dato actual
        print(json.dumps(dato))
        
    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }))

if __name__ == "__main__":
    simular_lectura_plc() 