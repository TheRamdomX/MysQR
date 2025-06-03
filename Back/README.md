# MysQR Backend

Este repositorio contiene tres microservicios que, en conjunto, permiten generar y validar códigos QR para clases usando Redis y cifrado AES rotativo.

---

## Servicios

### 1. QR Service

- **Funcionalidad**  
  - Genera y actualiza códigos QR para las clases.  
  - Escucha comandos en Redis en el canal `qr_commands`.  
  - Escucha solicitudes de validación en Redis en el canal `qr_validations`.  
  - Expone un endpoint HTTP para validación por POST `/validate`.  
  - Maneja TTL de los QR (por defecto 100 minutos, configurable en el código).  
  - Usa una clave AES que rota diariamente mediante HMAC-SHA256 de una semilla `AES_SECRET_BASE`.

- **Puerto**: `8087`

- **Variables de entorno obligatorias**  
  - `AES_SECRET_BASE`: Semilla Base64 de 32 bytes para derivar la clave AES diaria.  
  - `REDIS_HOST` y `REDIS_PORT`: Host y puerto de Redis (por defecto `localhost:6379`).  

- **Requisitos previos**  
  - Go (versión indicada en `qr/go.mod`).  
  - Redis corriendo en `localhost:6379`.  

- **Instrucciones de desarrollo local**  
  1. Abrir terminal y posicionarse en la carpeta `qr/`.  
  2. Definir la semilla AES:
     ```bash
     export AES_SECRET_BASE="TU_SEMILLA_32_BYTES_EN_BASE64"
     export REDIS_HOST="localhost"
     export REDIS_PORT="6379"
     ```
  3. Instalar dependencias y compilar:
     ```bash
     make install
     make run
     ```
     Esto ejecuta `go run ./cmd/main.go`.  
  4. (Opcional) Construir la imagen Docker:
     ```bash
     make docker-build
     make docker-run
     ```  
     El contenedor iniciará en el puerto `8087`.

---

### 2. Teacher Service

- **Funcionalidad**  
  - Provee endpoints REST para enviar comandos a Redis y generar/detener la emisión de QR para una clase.  
  - Publica en el canal `qr_commands` los eventos:
    - `POST /classes/:classId/start` → `{"event_type":"qr_start","class_id":"<classId>"}`
    - `POST /classes/:classId/stop`  → `{"event_type":"qr_stop","class_id":"<classId>"}`  

- **Puerto**: `8081`

- **Requisitos previos**  
  - Go (versión indicada en `teacher/go.mod`).  
  - Redis corriendo en `localhost:6379`.  

- **Instrucciones de desarrollo local**  
  1. Abrir terminal y posicionarse en la carpeta `teacher/`.  
  2. Instalar dependencias y compilar:
     ```bash
     make install
     make run
     ```
  3. (Opcional) Construir la imagen Docker:
     ```bash
     make docker-build
     make docker-run
     ```

---

### 3. Student Service

- **Funcionalidad**  
  - Provee un endpoint para que el estudiante “lea” el contenido de un QR.  
  - El cliente envía el texto cifrado que venía en el QR; el servicio lo descifra y publica una solicitud de validación en Redis en el canal `qr_validations`.  
  - El listener de validación (QR Service) procesará el resultado y podrá responder de vuelta al estudiante.  

- **Puerto**: `8082`

- **Requisitos previos**  
  - Go (versión indicada en `student/go.mod`).  
  - Redis corriendo en `localhost:6379`.  

- **Instrucciones de desarrollo local**  
  1. Abrir terminal y posicionarse en la carpeta `student/`.  
  2. Instalar dependencias y compilar:
     ```bash
     make install
     make run
     ```
  3. (Opcional) Construir la imagen Docker:
     ```bash
     make docker-build
     make docker-run
     ```

---

## Flujo completo de prueba

1. **Levantar Redis** (si aún no está en ejecución):
   ```bash
   redis-server
