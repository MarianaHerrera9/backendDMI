# 🔐 SECURITY.md

## 🧭 Principios de seguridad aplicados

- Uso de **JWT (JSON Web Tokens)** para autenticación segura.
- **Cifrado de contraseñas** con bcryptjs.
- Comunicación **HTTP segura** (preparado para HTTPS en despliegue).
- Manejo de **variables de entorno** (.env) para ocultar claves y credenciales.
- **Validación de datos** antes de guardarlos o enviarlos a la API.
- Restricción de **CORS** para controlar el acceso entre frontend y backend.

---

## ⚠️ Amenazas identificadas y mitigaciones

| Amenaza | Mitigación aplicada |
|----------|--------------------|
| Fuga de tokens JWT | Los tokens se almacenan en memoria, evitando almacenamiento persistente inseguro. |
| Exposición de contraseñas | Las contraseñas se cifran con bcryptjs antes de almacenarse en la base de datos. |
| Acceso no autorizado a endpoints | Middleware de autenticación valida los tokens antes de procesar solicitudes. |
| Inyección SQL | Uso de ORM (Sequelize) y consultas parametrizadas para prevenir inyecciones. |
| Fuga de información sensible | Uso de archivos `.env` ignorados en Git para proteger credenciales. |
| Exposición del backend | Implementación de CORS para limitar orígenes permitidos. |

---

## 🧩 Lineamientos de seguridad para el equipo

- ❌ **No subir archivos `.env` o claves privadas** al repositorio.
- ✅ Usar variables de entorno para todos los secretos, contraseñas y URLs.
- ⚙️ Validar y sanitizar todos los datos recibidos del cliente.
- 🔐 Mantener las dependencias y librerías actualizadas.
- 🧑‍💻 Revisar los permisos antes de exponer rutas o endpoints.
- 📡 Evitar probar o ejecutar la app en redes públicas no seguras.
- 🧾 Documentar cualquier cambio que afecte la seguridad del sistema.

--

## Cifrado de datos en reposo (AES-256)

Los datos sensibles almacenados en la base de datos se cifran con el algoritmo AES-256 mediante la función encryptData() del módulo crypto.js.
Esto garantiza que, incluso si la base de datos es comprometida, la información no pueda ser interpretada sin la clave de cifrado definida en el entorno (.env).

---

## Políticas de minimización y portabilidad (GDPR)
Minimización: Solo se recopilan los datos estrictamente necesarios para el funcionamiento del sistema (nombre, correo y contraseña).
Retención limitada: Los datos se conservan únicamente durante el tiempo necesario.
Portabilidad: Los usuarios pueden solicitar la exportación o eliminación de sus datos.
El backend puede descifrar la información con decryptData() para cumplir con solicitudes de acceso conforme al GDPR.
Protección en reposo: Toda la información sensible se almacena cifrada con AES-256, y las contraseñas se protegen con bcryptjs antes de guardarse.

---

## 🧠 Recomendaciones futuras

- Migrar a HTTPS con certificados SSL en despliegue.
- Implementar refresh tokens con expiración controlada.
- Añadir monitoreo de errores y accesos sospechosos.
- Considerar autenticación multifactor (MFA) para usuarios sensibles.