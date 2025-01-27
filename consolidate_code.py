import os

# Nombres de los archivos de salida
OUTPUT_FILE_FRONTEND = "consolidated_code_frontend.txt"
OUTPUT_FILE_BACKEND = "consolidated_code_backend.txt"

# Directorios a excluir
EXCLUDED_DIRS = {"node_modules", ".git", "__pycache__", "venv", "user_data", "uploads"}

# Extensiones de archivo a incluir para frontend y backend
INCLUDED_EXTENSIONS_FRONTEND = {".js", ".jsx", ".html", ".css"}
INCLUDED_EXTENSIONS_BACKEND = {".js", ".jsx", ".py"}

def consolidate_code(directory, included_extensions, output_file):
    """
    Consolida el contenido de los archivos especificados en OUTPUT_FILE,
    excluyendo los directorios definidos.
    
    Args:
        directory (str): Ruta al directorio a consolidar (e.g., 'frontend' o 'backend').
        included_extensions (set): Conjunto de extensiones de archivo a incluir.
        output_file (str): Nombre del archivo de salida.
    """
    with open(output_file, "w", encoding="utf-8") as output:
        for root, dirs, files in os.walk(directory):
            # Filtrar directorios excluidos
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            
            for file in files:
                # Procesar solo archivos con las extensiones incluidas
                if any(file.endswith(ext) for ext in included_extensions):
                    filepath = os.path.join(root, file)
                    # Escribir el encabezado del archivo
                    output.write(f"\n----- {filepath} -----\n")
                    try:
                        # Leer y escribir el contenido del archivo
                        with open(filepath, "r", encoding="utf-8") as f:
                            content = f.read()
                            output.write(content)
                    except UnicodeDecodeError:
                        output.write("\n[Error: Archivo contiene caracteres no compatibles]\n")
                    except FileNotFoundError:
                        output.write("\n[Error: Archivo no encontrado]\n")
                    except Exception as e:
                        # Manejar otros errores de lectura
                        output.write(f"\n[Error inesperado: {e}]\n")
    print(f"\nEl código consolidado para '{directory}' ha sido guardado en '{output_file}'.")

def main():
    # Verificar que los directorios frontend y backend existan
    if not os.path.isdir("frontend"):
        print("Error: El directorio 'frontend' no existe en la ubicación actual.")
        return
    if not os.path.isdir("backend"):
        print("Error: El directorio 'backend' no existe en la ubicación actual.")
        return
    
    # Consolidar el código del frontend
    consolidate_code(
        directory="frontend",
        included_extensions=INCLUDED_EXTENSIONS_FRONTEND,
        output_file=OUTPUT_FILE_FRONTEND
    )
    
    # Consolidar el código del backend
    consolidate_code(
        directory="backend",
        included_extensions=INCLUDED_EXTENSIONS_BACKEND,
        output_file=OUTPUT_FILE_BACKEND
    )

if __name__ == "__main__":
    main()
