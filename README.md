# MysQR - Sistema de Asistencia con Códigos QR

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/TheRamdomX/MysQR)
[![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://golang.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

MysQR es una aplicación móvil y sistema backend para la gestión de asistencia mediante códigos QR. Permite a los profesores generar códigos QR para sus clases y a los estudiantes registrar su asistencia escaneando estos códigos.

## Características

- Generación dinámica de códigos QR para clases
- Escaneo de códigos QR para registro de asistencia
- Interfaz intuitiva para profesores y estudiantes
- Sistema de microservicios escalable
- Aplicación móvil multiplataforma (iOS/Android)

## Uso de la Aplicación

1. **Profesores**:
   - Iniciar sesión en la aplicación
   - Abrir "Generar QR": el backend deriva la sección/módulo vigente según el horario y muestra un código que se renueva solo cada pocos segundos mientras el modal esté abierto
   - Cerrar el modal cuando termine la clase (el código deja de renovarse y expira solo)

2. **Estudiantes**:
   - Iniciar sesión en la aplicación
   - Escanear el código QR de la clase
   - Confirmar asistencia

## Arquitectura

El proyecto está dividido en dos partes principales:

### Backend (Go)

`Back/` es un único módulo Go (`mysqr`, un solo `go.mod`) con cuatro binarios independientes bajo `<servicio>/cmd`, más paquetes compartidos en `Back/pkg/`. Traefik enruta todo por prefijo de path detrás de un único host:puerto (`:8088`).

1. **Database Service** (`/api/db`, puerto 8084)
   - Única capa de acceso a Postgres; el resto de los servicios que necesitan la base la importan en proceso (`mysqr/database/pkg/postgres`), no le pegan por HTTP
   - Secciones, reportes de asistencia (dos funciones PL/pgSQL), alta manual de asistencia, carga masiva de alumnos por CSV

2. **QR/Auth Service** (`/api/qr`, puerto 8087)
   - Login por rol y emisión de JWT (`POST /login`)
   - Validación de sesión al abrir la app (`POST /validate-token`)

3. **Teacher Service** (`/api/classes`, puerto 8086)
   - `POST /api/classes/start`: exige JWT de profesor, deriva la sección/módulo vigente desde el horario y emite un QR cifrado con vigencia corta (TTL en Redis), sin confiar en nada que mande el cliente

4. **Student Service** (`/api/scan`, puerto 8085)
   - `POST /api/scan`: exige JWT de alumno, descifra el QR, valida que siga vigente en Redis, que el alumno esté inscrito en esa sección y que no haya marcado ya esa clase, y recién ahí escribe en `Asistencia`

Paquetes compartidos en `Back/pkg/`: `qrcode` (cifrado y store de Redis del QR), `authmw` (middleware de JWT para Gin) y `httpcors`.

### Frontend (React Native/Expo)

`Front/` es la raíz del proyecto Expo (no `Front/app` — esa carpeta es solo el árbol de rutas de Expo Router).

- `app/` — pantallas, agrupadas por rol con *route groups* que no afectan la URL: `(auth)/` (home, selección de rol, logins), `(teacher)/` (cursos, lista de asistencia), `(student)/` (cursos, lista de asistencia)
- `services/` — llamadas HTTP puras a cada servicio del backend (`api.ts` centraliza la URL base)
- `hooks/` — estado y efectos de React que envuelven esos servicios
- `types/domain.ts` — tipos de dominio compartidos entre pantallas
- `context/AuthContext.tsx` — sesión (token JWT, datos del usuario) persistida en `AsyncStorage`
- Soporte iOS/Android/web



## Instalación y Ejecución

### Backend

1. Navegar al directorio `Back`:
   ```bash
   cd Back
   ```

2. Levantar todo (Postgres, Redis, Traefik y los cuatro servicios) con Docker Compose:
   ```bash
   make up
   # equivale a: docker compose up -d --build
   ```

   La API queda disponible completa en `http://localhost:8088` (Traefik enruta `/api/db`, `/api/qr`, `/api/classes` y `/api/scan` a cada servicio).

3. Para bajarlo o ver logs:
   ```bash
   make down
   make logs
   ```

Para desarrollo local sin Docker, todos los servicios comparten un único `go.mod` en la raíz de `Back/` — no hace falta `go mod init` por servicio. Con Postgres y Redis corriendo (por ejemplo, `docker compose up -d postgres redis`), cada uno se levanta con:

```bash
make run-database   # :8084
make run-qr         # :8087
make run-teacher    # :8086
make run-student    # :8085
```

Otros targets útiles: `make build` (compila los cuatro), `make vet`, `make fmt`, `make tidy`.

### Frontend

1. Navegar al directorio del proyecto Expo (la raíz es `Front/`, no `Front/app` — esa carpeta es solo el árbol de rutas):
   ```bash
   cd Front
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Si el backend no corre en `localhost`, ajustar la URL base en `services/api.ts` (es el único lugar donde se declara):
   ```ts
   export const API_URL = 'http://<tu-ip>:8088';
   ```

4. Iniciar la aplicación:
   ```bash
   npx expo start
   ```


