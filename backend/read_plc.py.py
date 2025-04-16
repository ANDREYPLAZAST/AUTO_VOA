# read_plc.py
import snap7
import snap7.util
import json
import time

plc = snap7.client.Client()
plc.connect('192.168.4.10', 0, 1)

if plc.get_connected():
    DB = plc.db_read(2, 0, 10)
    data = {
        "referencia_nivel_tanque_cm": snap7.util.get_int(DB, 0),
        "nivel_actual_tanque_cm": snap7.util.get_int(DB, 2),
        "rpms_bomba": snap7.util.get_int(DB, 4),
        "estado_boton_start": int(snap7.util.get_bool(DB, 6, 0)),
        "estado_boton_stop": int(snap7.util.get_bool(DB, 6, 1)),
        "estado_boton_paro_emergencia": int(snap7.util.get_bool(DB, 6, 2)),
        "estado_boton_confirmar": int(snap7.util.get_bool(DB, 6, 3))
    }
    print(json.dumps(data))

plc.disconnect()
plc.destroy()