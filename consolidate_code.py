import os

# Nombre del archivo de salida
OUTPUT_FILE = "consolidated_code.txt"

# Directorios a excluir
EXCLUDED_DIRS = {"node_modules", ".git", "__pycache__", "venv", "user_data"}

# Extensiones de archivo a incluir
INCLUDED_EXTENSIONS = {".js", ".html", ".py"}

def consolidate_code():
    """
    Consolida el contenido de los archivos especificados en OUTPUT_FILE,
    excluyendo los directorios y extensiones definidos.
    """
    with open(OUTPUT_FILE, "w", encoding="utf-8") as output:
        for root, dirs, files in os.walk("."):
            # Filtrar directorios excluidos
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

            for file in files:
                # Procesar solo archivos con las extensiones incluidas
                if any(file.endswith(ext) for ext in INCLUDED_EXTENSIONS):
                    filepath = os.path.join(root, file)
                    # Escribir el encabezado del archivo
                    output.write(f"\n----- {filepath} -----\n")
                    try:
                        # Leer y escribir el contenido del archivo
                        with open(filepath, "r", encoding="utf-8") as f:
                            output.write(f.read())
                    except UnicodeDecodeError:
                        output.write("\n[Error: Archivo contiene caracteres no compatibles]\n")
                    except FileNotFoundError:
                        output.write("\n[Error: Archivo no encontrado]\n")
                    except Exception as e:
                        # Manejar otros errores de lectura
                        output.write(f"\n[Error inesperado: {e}]\n")
    print(f"\nEl código consolidado ha sido guardado en {OUTPUT_FILE}")

if __name__ == "__main__":
    consolidate_code()
