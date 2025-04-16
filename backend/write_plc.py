import snap7
import sys
import json

def write_to_plc(setpoint_value):
    try:
        # Configuración de la conexión al PLC
        plc = snap7.client.Client()
        plc.connect('192.168.4.10', 0, 1)

        # Leer el DB actual
        DB_bytearray = plc.db_read(2, 0, 50)  # DB number, start, size

        # Escribir el nuevo valor de setpoint como entero
        snap7.util.set_int(DB_bytearray, 0, int(setpoint_value))
        plc.db_write(2, 0, DB_bytearray)

        # Leer de nuevo para verificar el cambio
        DB_bytearray_nuevo = plc.db_read(2, 0, 50)
        valor_verificado = snap7.util.get_int(DB_bytearray_nuevo, 0)
        
        # Cerrar la conexión
        plc.disconnect()

        # Retornar el resultado
        return {
            "success": True,
            "valor_escrito": setpoint_value,
            "valor_verificado": valor_verificado
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    # Obtener el valor del setpoint del argumento de línea de comandos
    setpoint_value = sys.argv[1]
    result = write_to_plc(setpoint_value)
    print(json.dumps(result)) 