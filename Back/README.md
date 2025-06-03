MysQR bBackend
QR Service

Generates and updates QR codes for classes.
Listens for Redis commands on qr_commands and validation requests on qr_validations.
Runs on port 8080.
Build & run using the qr/Makefile.
Teacher Service

Provides REST endpoints to send start and stop commands to generate QR codes.
Endpoints:
POST /classes/:classId/start – sends a start command.
POST /classes/:classId/stop – sends a stop command.
Runs on port 8081.
Build using the instructions in teacher/Makefile.
Student Service

Provides an endpoint to scan a QR code.
Decrypts received QR data and forwards a validation request.
Runs on port 8082.
Build instructions are in the student/Makefile.
Getting Started
Prerequisites
Go (versions as specified in each microservice's go.mod)
Docker (if using Docker to build and run microservices)
Redis server running on localhost:6379
Local Development
Este repositorio contiene tres microservicios que, en conjunto, permiten generar y validar códigos QR para clases usando Redis y cifrado AES rotativo.

Servicios
1. QR Service
Navigate to the qr folder.
Install dependencies:
make install
run de project:
make run
build the docker container:
make docker-build
run the docker container:
make docker-run
OPTIONAL:

build the project:
make build
Funcionalidad

Genera y actualiza códigos QR para las clases.
Escucha comandos en Redis en el canal qr_commands.
Escucha solicitudes de validación en Redis en el canal qr_validations.
Expone un endpoint HTTP para validación por POST /validate.
Maneja TTL de los QR (por defecto 100 minutos, configurable en el código).
Usa una clave AES que rota diariamente mediante HMAC-SHA256 de una semilla AES_SECRET_BASE.
Puerto: 8087

Variables de entorno obligatorias

AES_SECRET_BASE: Semilla Base64 de 32 bytes para derivar la clave AES diaria.
REDIS_HOST y REDIS_PORT: Host y puerto de Redis (por defecto localhost:6379).
Requisitos previos

Go (versión indicada en qr/go.mod).
Redis corriendo en localhost:6379.
Instrucciones de desarrollo local

Abrir terminal y posicionarse en la carpeta qr/.
Definir la semilla AES:
export AES_SECRET_BASE="TU_SEMILLA_32_BYTES_EN_BASE64"
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
Instalar dependencias y compilar:
make install
make run
Esto ejecuta go run ./cmd/main.go.
(Opcional) Construir la imagen Docker:
make docker-build
make docker-run
El contenedor iniciará en el puerto 8087.
Student2. Teacher Service
Navigate to the student folder.
Install dependencies:
make install
run de project:
make run
build the docker container:
make docker-build
run the docker container:
make docker-run
OPTIONAL:

build the project:
make build
Funcionalidad

Provee endpoints REST para enviar comandos a Redis y generar/detener la emisión de QR para una clase.
Publica en el canal qr_commands los eventos:
POST /classes/:classId/start → {"event_type":"qr_start","class_id":"<classId>"}
POST /classes/:classId/stop → {"event_type":"qr_stop","class_id":"<classId>"}
Puerto: 8081

Requisitos previos

Go (versión indicada en teacher/go.mod).
Redis corriendo en localhost:6379.
Instrucciones de desarrollo local

Abrir terminal y posicionarse en la carpeta teacher/.
Instalar dependencias y compilar:
make install
make run
(Opcional) Construir la imagen Docker:
make docker-build
make docker-run
Teacher3. Student Service
Navigate to the teacher folder.
Install dependencies:
make install
run de project:
make run
build the docker container:
make docker-build
run the docker container:
make docker-run
OPTIONAL:

build the project:
make build
Funcionalidad

Provee un endpoint para que el estudiante “lea” el contenido de un QR.
El cliente envía el texto cifrado que venía en el QR; el servicio lo descifra y publica una solicitud de validación en Redis en el canal qr_validations.
El listener de validación (QR Service) procesará el resultado y podrá responder de vuelta al estudiante.
Puerto: 8082

Requisitos previos

Go (versión indicada en student/go.mod).
Redis corriendo en localhost:6379.
Instrucciones de desarrollo local

Abrir terminal y posicionarse en la carpeta student/.
Instalar dependencias y compilar:
make install
make run
(Opcional) Construir la imagen Docker:
make docker-build
make docker-run
Flujo completo de prueba
Levantar Redis (si aún no está en ejecución):
redis-server
