import os

# 🟩 RUTAS QUE SE VAN A LEER
rutas = [
    r"C:\GitHub\TemucoSoft-S.A._eva4\front\src\admin-temucosoft\Pages\ClientAdmins",
    r"C:\GitHub\TemucoSoft-S.A._eva4\front\src\admin-temucosoft\Pages\Companies",
    r"C:\GitHub\TemucoSoft-S.A._eva4\front\src\admin-temucosoft\Pages\Dashboard",

]

# 🟦 ARCHIVO DE SALIDA
archivo_salida = "contenido_paginasTS.txt"

def leer_archivo(ruta):
    """Lee el contenido de un archivo de texto (.py o .html)"""
    try:
        with open(ruta, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception as e:
        return f"[Error al leer {ruta}: {e}]"

def main():
    with open(archivo_salida, "w", encoding="utf-8") as salida:
        for carpeta in rutas:
            if not os.path.exists(carpeta):
                salida.write(f"\n[Carpeta no encontrada: {carpeta}]\n")
                continue

            salida.write(f"\n\n{'#'*80}\n📁 Carpeta: {carpeta}\n{'#'*80}\n")

            for archivo in os.listdir(carpeta):
                ruta_archivo = os.path.join(carpeta, archivo)

                # Ignorar si es carpeta
                if os.path.isdir(ruta_archivo):
                    continue

                # Solo procesar .py y .html
                if archivo.lower().endswith((".py", ".jsx")):
                    contenido = leer_archivo(ruta_archivo)
                    salida.write(f"\n\n===== {archivo} =====\n")
                    salida.write(contenido)
                    salida.write("\n" + "="*60 + "\n")

    print(f"✅ Listo. Se guardó todo en '{archivo_salida}'")

if __name__ == "__main__":
    main()