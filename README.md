# Proyecto 3 - Backend

Backend del proyecto fullStack con los endpoints para proporcionar los datos necesarios al fronted

## Objetivo

- Diseñar un servidor backend con node que conecte a una base de datos mongo Atlas
- Se usará para el alojamiento de imágenes Cloudinary.
- Los roles están definidos como usuario normal y administrador.
- Cada usuario puede comprar libros que tendra en su biblioteca, tendrá una seccion de los que esta leyendo actualmente manteniendo la página por la que lo dejó
- Los administradores son los únicos que pueden modificar libros y gestionar el catálogo
- Se generaran libros y usuarios desde un Excel para poblar minimamente la base de datos. El sistema transformará los datos con formato antiguo a datos válidos para mongo mediante código
- Se usará tokens de sesión para validar el acceso a los endpoints


## Dependencias 

- Nodemon (Para el desarrollo)
- Mongoose (Base de datos)
- Express (Enrutador y ejecución del server)
- Dotenv (Habilita acceso a las variables de entorno del file `.env`)
- Bcrypt (Codifica o compara contraseñas)
- JsonWebToken (JWT para comprobar sesiones activas, roles, ...)
- Multer (acceso a ficheros enviados)
- Storage Cloudinary (Guardado de imagenes remoto)

## Configuración

- Se establece el dns del servicio en *1.1.1.1* (Cloudflare) y *8.8.8.8* (Google) para evitar conflictos de conexión con la base de datos en Mongo Atlas.