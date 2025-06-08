# MysQR - Sistema de Asistencia con Códigos QR

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/TheRamdomX/MysQR)
[![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://golang.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

MysQR es una aplicación móvil y sistema backend para la gestión de asistencia mediante códigos QR. Permite a los profesores generar códigos QR para sus clases y a los estudiantes registrar su asistencia escaneando estos códigos.

## 🚀 Características

- Generación dinámica de códigos QR para clases
- Escaneo de códigos QR para registro de asistencia
- Interfaz intuitiva para profesores y estudiantes
- Sistema de microservicios escalable
- Aplicación móvil multiplataforma (iOS/Android)

## 🏗️ Arquitectura

El proyecto está dividido en dos partes principales:

### Backend (Go)

El backend está compuesto por tres microservicios:

1. **QR Service** (Puerto 8080)
   - Generación y actualización de códigos QR
   - Comunicación mediante Redis
   - Gestión de validaciones

2. **Teacher Service** (Puerto 8081)
   - API REST para profesores
   - Endpoints para iniciar/detener generación de QR
   - Gestión de clases

3. **Student Service** (Puerto 8082)
   - API para validación de códigos QR
   - Procesamiento de escaneos
   - Registro de asistencia

### Frontend (React Native/Expo)

- Aplicación móvil multiplataforma
- Interfaz de usuario moderna y responsiva
- Soporte para iOS y Android
- Navegación basada en archivos

## 🛠️ Tecnologías Utilizadas

### Backend
- **[Go](https://golang.org/)** - Lenguaje principal de programación
- **[Redis](https://redis.io/)** - Base de datos en memoria para comunicación entre servicios
- **[Docker](https://www.docker.com/)** - Contenedorización de servicios
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestación de contenedores
- **[Traefik](https://traefik.io/)** - Proxy inverso y balanceador de carga
- **[Gin](https://gin-gonic.com/)** - Framework web para Go
- **[GORM](https://gorm.io/)** - ORM para Go

### Frontend
- **[React Native](https://reactnative.dev/)** - Framework para desarrollo móvil
- **[Expo](https://expo.dev/)** - Plataforma de desarrollo móvil
- **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado de JavaScript
- **[React Navigation](https://reactnavigation.org/)** - Navegación entre pantallas
- **[React Native Paper](https://callstack.github.io/react-native-paper/)** - Componentes de UI
- **[Axios](https://axios-http.com/)** - Cliente HTTP

## 🛠️ Requisitos Previos

- Go (versiones especificadas en go.mod)
- Node.js y npm
- Docker y Docker Compose
- Redis
- Expo CLI

## 🚀 Instalación y Ejecución

### Backend

1. Navegar al directorio `Back`:
   ```bash
   cd Back
   ```

2. Iniciar los servicios con Docker Compose:
   ```bash
   docker-compose up -d
   ```

Para desarrollo local, cada microservicio puede ejecutarse individualmente:

#### QR Service
```bash
cd qr
make install
make run
```

#### Teacher Service
```bash
cd teacher
make install
make run
```

#### Student Service
```bash
cd student
make install
make run
```

### Frontend

1. Navegar al directorio de la aplicación:
   ```bash
   cd Front/app
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar la aplicación:
   ```bash
   npx expo start
   ```

## 📱 Uso de la Aplicación

1. **Profesores**:
   - Iniciar sesión en la aplicación
   - Seleccionar una clase
   - Generar código QR para la asistencia
   - Detener la generación cuando sea necesario

2. **Estudiantes**:
   - Iniciar sesión en la aplicación
   - Escanear el código QR de la clase
   - Confirmar asistencia

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📧 Contacto

Para preguntas y soporte, por favor abrir un issue en el repositorio. 