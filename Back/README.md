# MysQR backend

1. **QR Service**  
   - Generates and updates QR codes for classes.
   - Listens for Redis commands on `qr_commands` and validation requests on `qr_validations`.
   - Runs on port **8080**.
   - Build & run using the [qr/Makefile](qr/Makefile).

2. **Teacher Service**  
   - Provides REST endpoints to send start and stop commands to generate QR codes.
   - Endpoints:
     - `POST /classes/:classId/start` – sends a start command.
     - `POST /classes/:classId/stop` – sends a stop command.
   - Runs on port **8081**.
   - Build using the instructions in [teacher/Makefile](teacher/Makefile).

3. **Student Service**  
   - Provides an endpoint to scan a QR code.
   - Decrypts received QR data and forwards a validation request.
   - Runs on port **8082**.
   - Build instructions are in the [student/Makefile](student/Makefile).

## Getting Started

### Prerequisites

- Go (versions as specified in each microservice's go.mod)
- Docker (if using Docker to build and run microservices)
- Redis server running on `localhost:6379`

### Local Development

#### QR Service
1. Navigate to the `qr` folder.
2. Install dependencies:
   ```bash
   make install
   ```
3. run de project:
   ```  bash
   make run
   ```
4. build the docker container:
   ```  bash
   make docker-build
   ```
5. run the docker container:
   ```  bash
   make docker-run
   ```
OPTIONAL:
1. build the project:
   ```
   make build
   ```

#### Student Service
1. Navigate to the `student` folder.
2. Install dependencies:
   ```bash
   make install
   ```
3. run de project:
   ```  bash
   make run
   ```
4. build the docker container:
   ```  bash
   make docker-build
   ```
5. run the docker container:
   ```  bash
   make docker-run
   ```
OPTIONAL:
1. build the project:
   ```
   make build
   ```

#### Teacher Service
1. Navigate to the `teacher` folder.
2. Install dependencies:
   ```bash
   make install
   ```
3. run de project:
   ```  bash
   make run
   ```
4. build the docker container:
   ```  bash
   make docker-build
   ```
5. run the docker container:
   ```  bash
   make docker-run
   ```
OPTIONAL:
1. build the project:
   ```
   make build
   ```
