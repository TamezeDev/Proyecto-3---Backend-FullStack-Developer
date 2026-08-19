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

## Instrucciones

## Acceso a endpoints

- Para garantizar el uso de las funciones de cada rol de usuario se deberá enviar el token de sesión para los endpoints que impliquen modificación de datos en la cabecerae de la petición.

```javascript
headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNjYxMmQxMWE1OWI5OGQyY2IzOTNhNSIsImlhdCI6MTc4NTA3NDU4NywiZXhwIjoxNzg1MTYwOTg3fQ.7ZyA18LgB-JVCfvNXCcrejCcfKP3BvmCeNp6oRSSpPs
```

## Usuarios

### 1. Registro de usuario

Envío mediante `POST` a:

```text
baseUrl/api/v1/users/create
```

```javascript
body
{
  "name": "Alejandro",
  "lastName": "García",
  "email": "alejandro.dev@example.com",
  "password": "Password123!",
  "birthDate": "1995-04-15"
}
```

### 2. Login de usuario

Envío mediante `POST` a:

```text
baseUrl/api/v1/users/login
```

```javascript
body
{
  "email": "alejandro.dev@example.com",
  "password": "Password123!"
}
```

### 3. Modificar un usuario su contraseña

Envío mediante `PUT` a:

```text
baseUrl/api/v1/users/modifyPass
```

```javascript
body
{
  "currentPass": "Password123!",
  "newPass": "Password1234!",
  "repeatNewPass": "Password1234!"
}
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Se gestionan errores de contraseñas que no cumplan el formato obligatorio.

### 4. Obtener todos los datos de usuarios

Envío mediante `GET` a:

```text
baseUrl/api/v1/users/
```

```javascript
body
{
  "currentPass": "Password123!",
  "newPass": "Password1234!",
  "repeatNewPass": "Password1234!"
}
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos. 
- Solo un usuario con rol *admin* puede hacer uso de este endpoint

### 5. Modificar o poner una imagen de perfil al usuario

Envío mediante `PUT` a:

```text
baseUrl/api/v1/users/imgProfile
```

```javascript
FormData
{
  "image": imagen seleccionada
}
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos. 
- Si el usuario tiene foto anteriormente la elimina del servidor para ahorro de espacio

### 6. Eliminar tarjeta de la lista de tarjetas del usuario

Envío mediante `DELETE` a:

```text
baseUrl/api/v1/users/card/:id
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos. 
- La tarjeta queda guardada en el servidor para uso de otro cliente que la pueda tener asociada


## Tarjetas de pago

### 1. Añadir una tarjeta a la lista del usuario

Envío mediante `POST` a:

```text
baseUrl/api/v1/cards/create
```

```javascript
body
{
  "nameOwner": "Usuario para pruebas",
  "numberCard": "1234567812345678",
  "expiredDate": "12/30",
  "cvv": "123"
}
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos. 
- Se validará los datos recibidos, como fecha de caducidad, formatos, ...

### 2. Eliminar tarjeta del servidor

Envío mediante `DELETE` a:

```text
baseUrl/api/v1/cards/:id
```


- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos. 
- Esta operación solo se puede realizar por administradores. Elimina la tarjeta del servidor y la desvincula de todo usuario que la tenga en su lista. (Por motivos de tarjeta fraudulenta o similar)

### 3. Añadir crédito a una tarjeta

Envío mediante `POST` a:

```text
baseUrl/api/v1/cards/addCredit/:id
```

```javascript
body
{
  "quantity": "12.50"
}
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos. 
- Para ingresar saldo, la tarjeta debe estar asociada a la lista de un usuario
- Se comprueba el tipo de dato enviado para transformar a Number y sumar al crédito actual

