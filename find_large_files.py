import os

# Función para calcular el tamaño de un archivo en bytes
def get_file_size(file_path):
    return os.path.getsize(file_path)

# Función para listar todos los archivos en un directorio y subdirectorios
def list_all_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            yield os.path.join(root, file)

# Lista para almacenar los archivos grandes
large_files = []

# Umbral de tamaño (en bytes) para considerar un archivo grande
large_file_threshold = 100 * 1024 * 1024  # 100 MB

# Recorrer todos los archivos en el repositorio
for file_path in list_all_files(os.getcwd()):
    # Obtener el tamaño del archivo
    file_size = get_file_size(file_path)

    # Si el tamaño del archivo supera el umbral, agregarlo a la lista
    if file_size >= large_file_threshold:
        large_files.append((file_path, file_size))

# Ordenar los archivos grandes por tamaño de mayor a menor
large_files.sort(key=lambda x: x[1], reverse=True)

# Imprimir los archivos grandes en la terminal
for file_path, file_size in large_files:
    print(f"Ruta: {file_path}")
    print(f"Tamaño: {file_size} bytes")
    print("----------------------------------------")