# 🧠 Backend - Sistema de Autenticación y Consumo de API

## 🚀 Instrucciones de instalación y ejecución

### 1️ Clonar el repositorio
```bash
git clone https://github.com/MarianaHerrera9/backendDMI.git
cd backendDMI
```
### 2️ Instalar dependencias
```bash
npm install
```
### 3️ Configurar la base de datos
```bash
Crea una base de datos en MySQL (puerto 3306 por defecto).

Ejemplo:

CREATE DATABASE nombre_bd;
```
### 4️ Configurar las variables de entorno
> Crea un archivo .env en la raíz del proyecto con los siguientes valores (ajusta según tu entorno):
```bash
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_bd
JWT_SECRET=tu_llave_secreta
```
### 5️ Ejecutar el servidor

Inicia el backend con:
```bash
npm start

o

npm run service
```

📦 Dependencias principales
```bash
express — servidor backend.

mysql2 / sequelize — conexión con base de datos MySQL.

jsonwebtoken (JWT) — autenticación segura.

bcryptjs — encriptación de contraseñas.

dotenv — manejo de variables de entorno.

cors — control de acceso desde el frontend.
```

### 🌐 Integración con el frontend

El backend expone endpoints para autenticación y consumo de datos mediante una API REST.
Ejemplo de endpoint para autenticación:

POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@correo.com",
  "password": "contraseña"
}


Respuesta esperada:

{
  "token": "jwt_token_generado",
  "usuario": {
    "id": 1,
    "nombre": "Usuario de prueba"
  }
}

🔒 Documentación de seguridad

Consulta el archivo SECURITY.md
> para conocer los principios y lineamientos de seguridad aplicados.


👥 Autores

Equipo de desarrollo:
```bash
Johan Emmanuel Balderas Alfonso
Jesús Enrique Carmona Lezama
Mariana Herrera Aburto
Yessenia Cristal Vázquez García
Héctor Miguel Ortega Rodríguez 
Kevin Diego Cruz
```
Proyecto de Seguridad y Consumo de Servicios en la Nube
Universidad Tecnológica de Tehuacán

---
