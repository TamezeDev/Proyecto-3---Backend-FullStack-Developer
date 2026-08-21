# Proyecto 3 - Backend

Backend del proyecto fullStack con los endpoints para proporcionar los datos necesarios al frontend

## Objetivo

- Diseñar un servidor backend con node que conecte a una base de datos mongo Atlas
- Se usará para el alojamiento de imágenes Cloudinary.
- Los roles están definidos como usuario normal y administrador.
- Cada usuario puede comprar libros que tendra en su biblioteca, tendrá una seccion de los que esta leyendo actualmente manteniendo la página por la que lo dejó
- Los administradores son los únicos que pueden modificar libros y gestionar el catálogo
- Se generaran libros y usuarios desde un Excel para poblar minimamente la base de datos. El sistema transformará los datos con formato antiguo a datos válidos para mongo mediante código
- Se usará tokens de sesión para validar el acceso a los endpoints
- Habrá un sistema de pago interno mediante tarjetas con credito (simulación)
- El acceso a la lectura y la modificación de la librería es solo para usuarios premium
- Los administradores pueden gestionar los planes premium


## Dependencias 

- Nodemon (Para el desarrollo)
- Mongoose (Base de datos)
- Express (Enrutador y ejecución del server)
- Dotenv (Habilita acceso a las variables de entorno del file `.env`)
- Bcrypt (Codifica o compara contraseñas)
- JsonWebToken (JWT para comprobar sesiones activas, roles, ...)
- Multer (acceso a ficheros enviados)
- Storage Cloudinary (Guardado de imagenes remoto)
- Node-cron (Tarea diaria para revisar y desactivar cuentas premium)

## Configuración

- Se establece el dns del servicio en *1.1.1.1* (Cloudflare) y *8.8.8.8* (Google) para evitar conflictos de conexión con la base de datos en Mongo Atlas.

## Instrucciones
- El proyecto se encuentra actualmente corriendo en producción y se puede acceder a los endpoints.

- Para correr el servidor desde tu equipo:
1. Descargar el proyecto
    
```bash
  git clone https://github.com/TamezeDev/Proyecto-3---Backend-FullStack-Developer.git
  cd Proyecto-3---Backend-FullStack-Developer
```
2. Instalar las dependencias necesarias
```bash
  npm i
```
3. Copiar el fichero de variables de entorno `.env` que se envia por email en la raiz del proyecto.
4. La base de datos se encuentra poblada y funcionando, no obstante, si se quiere probar el script que genera los datos mínimos necesarios para el funcionamiento.

```bash
  cd seeds
  node init.seed.js
```
- Por consola se le avisará del proceso completado.

5.  Para correr el servidor desde tu equipo:

```bash
  cd ..
  npm run start
```
- Importante: Tener el puerto 3000 del equipo disponible para levantar el servidor. En caso necesario puede modificar el puerto en el archivo `.env` indicando el puerto que quiera usar.

6. Ya puede acceder a los endpoints !!!

## Semillas de la base de datos

El proyecto incluye un script de semillas que lee varios CSV y los inserta en MongoDB respetando las relaciones entre colecciones para crear un mínimo con el que usar posteriormente en el frontend.

### Origen de los datos

- `books.csv` contiene 60 libros reales (título, autor e ISBN-13 verificados), obtenidos de un dataset
  público derivado de Goodreads. El campo `content` incluye contenido de relleno tipo Lorem Ipsum
  (8 "páginas" por libro), ya que el texto real de los libros no es el foco del proyecto.
- `genres.csv`, `premiumPrices.csv`, `cardPayments.csv` y `users.csv` son datos sintéticos generados
  para dar coherencia relacional al conjunto (usuarios con biblioteca, lectura activa, tarjeta de pago
  y, en algunos casos, cuenta premium ya activada).
- Los usuarios referencian sus libros mediante el campo `isbn` (no un `_id`, que no existe hasta la
  inserción), y las tarjetas y cuentas premium referencian al usuario mediante su `email`. El script
  resuelve estas referencias en memoria con `Map` una vez insertada cada colección dependiente.

### Orden de inserción (por dependencias)

1. `genres.csv` → géneros.
2. `books.csv` → libros, resolviendo el género por nombre.
3. `premiumPrices.csv` → planes premium.
4. `cardPayments.csv` → tarjetas de pago.
5. `users.csv` → usuarios, resolviendo biblioteca y lectura por ISBN, tarjeta por email, y creando
   además una `PremiumAccount` para los usuarios que ya tienen un plan activo asignado en el CSV.

- Se establece el orden para poder conseguir los ids necesarios para vincular las  colecciones relaccionadas.
- El script principal se gestiona mediante una transacción. En caso de error se deja la base de datos vacía para evitar conflictos posteriores.

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

## Cuenta premium

### 1. Activar o renovar cuenta premium de usuario

Envío mediante `POST` a:

```text
baseUrl/api/v1/premium/setPremium
```

```javascript
body
{
  "plan": "Plan Anual",
  "cardId": "66a1f3c9e4b0a2d1f8c9e123"
}
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- El campo `plan` debe coincidir con el `name` de un plan existente en el catálogo (`baseUrl/api/v1/plans/`).
- El campo `cardId` debe corresponder a una tarjeta ya asociada a la lista de tarjetas del usuario (ver *Añadir una tarjeta a la lista del usuario*).
- Se comprueba que la tarjeta tenga saldo suficiente para cubrir el precio del plan antes de efectuar el cobro.
- Si el usuario no tenía cuenta premium previamente, se crea una nueva; si ya la tenía, se actualiza con la nueva duración y fecha de próximo pago, y se añade la fecha del pago al historial.
- El cobro y la activación/actualización de la cuenta premium se ejecutan dentro de una transacción: si algo falla al guardar la cuenta premium, el cobro se revierte automáticamente.

## Planes premium

### 1. Obtener todos los planes premium

Envío mediante `GET` a:

```text
baseUrl/api/v1/plans/
```

- No requiere token de sesión, cualquier cliente puede consultar los planes disponibles para mostrarlos en el front antes de contratar uno.

### 2. Crear un nuevo plan premium

Envío mediante `POST` a:

```text
baseUrl/api/v1/plans/create
```

```javascript
body
{
  "name": "Plan Anual",
  "durationMonths": 12,
  "price": 59.99
}
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Esta operación solo se puede realizar por administradores.
- Se valida que no exista previamente un plan con el mismo nombre.

### 3. Modificar un plan premium

Envío mediante `PUT` a:

```text
baseUrl/api/v1/plans/modify/:id
```

```javascript
body
{
  "name": "Plan Anual Promo",
  "price": 49.99,
  "durationMonths": 12
}
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Esta operación solo se puede realizar por administradores.
- Se puede enviar cualquier combinación de `name`, `price` y `durationMonths`; solo se actualizan los campos incluidos en el body.

### 4. Eliminar un plan premium

Envío mediante `DELETE` a:

```text
baseUrl/api/v1/plans/:id
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Esta operación solo se puede realizar por administradores.
- Elimina el plan del catálogo; no afecta a las cuentas premium ya activas con la duración/precio contratados previamente.

## Libros

### 1. Añadir un nuevo libro al catálogo

Envío mediante `POST` a:

```text
baseUrl/api/v1/books/create
```

```javascript
body
{
  "bookName": "Cien años de soledad",
  "isbn": "9780307474728",
  "author": "Gabriel García Márquez",
  "pages": 471,
  "synopsis": "La historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.",
  "content": [
    "Texto de la página 1...",
    "Texto de la página 2...",
    "Texto de la página 3..."
  ],
  "genreName": "Realismo mágico"
}
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Esta operación solo se puede realizar por administradores.
- El campo `author` es opcional; si no se envía, se asigna automáticamente `"Anónimo"`.
- El campo `isbn` debe ser único; si ya existe un libro con ese ISBN, la petición se rechaza.
- El campo `genreName` se envía como texto: si el género ya existe se reutiliza, y si no existe se crea automáticamente.
- El libro se crea con `available: true` por defecto.

### 2. Obtener catálogo de libros disponibles

Envío mediante `GET` a:

```text
baseUrl/api/v1/books/
```

- No requiere token de sesión, cualquier cliente puede consultar el catálogo público.
- Solo devuelve los libros con `available: true`.

### 3. Obtener libros desactivados

Envío mediante `GET` a:

```text
baseUrl/api/v1/books/disabled
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Esta operación solo se puede realizar por administradores.
- Devuelve los libros con `available: false`  para gestionar el catálogo.
### 4. Activar un libro en el catálogo

Envío mediante `PUT` a:

```text
baseUrl/api/v1/books/enable/:id
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Esta operación solo se puede realizar por administradores.
- Marca el libro como `available: true`, haciéndolo visible en el catálogo público.

### 5. Desactivar un libro del catálogo

Envío mediante `PUT` a:

```text
baseUrl/api/v1/books/disable/:id
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Esta operación solo se puede realizar por administradores.
- Marca el libro como `available: false` en vez de eliminarlo físicamente, para no romper las referencias de los usuarios que lo tengan en su biblioteca personal o en lectura actual.

## Biblioteca y lectura

### 1. Añadir un libro a la biblioteca

Envío mediante `POST` a:

```text
baseUrl/api/v1/users/library/:id
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Se requiere cuenta premium activa.
- `:id` es el id del libro a añadir; debe existir y estar disponible en el catálogo.
- Si el libro ya está en la biblioteca del usuario, la petición se rechaza.

### 2. Eliminar un libro de la biblioteca

Envío mediante `DELETE` a:

```text
baseUrl/api/v1/users/library/:id
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Si el libro también estaba en la lista de lectura actual, se elimina de ambas listas a la vez.

### 3. Obtener la biblioteca del usuario

Envío mediante `GET` a:

```text
baseUrl/api/v1/users/library
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Devuelve la lista de libros de la biblioteca con los datos del libro ya incluidos (populate), lista para mostrar en el front.

### 4. Empezar a leer un libro

Envío mediante `POST` a:

```text
baseUrl/api/v1/users/reading/:id
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Se requiere cuenta premium activa.
- El libro debe estar previamente en la biblioteca del usuario.
- Si el libro ya está en la lista de lectura actual, la petición se rechaza.
- Se inicializa `currentPage` según el valor por defecto del modelo.

### 5. Dejar de leer un libro

Envío mediante `DELETE` a:

```text
baseUrl/api/v1/users/reading/:id
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Se requiere cuenta premium activa.
- Elimina el libro de la lista de lectura actual, tanto si se ha terminado como si se ha abandonado.

### 6. Obtener la lista de libros en lectura actual

Envío mediante `GET` a:

```text
baseUrl/api/v1/users/reading
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Se requiere cuenta premium activa; este endpoint queda deliberadamente bloqueado para usuarios sin premium.
- Devuelve la lista de lectura con los datos del libro ya incluidos (populate).

### 7. Obtener el progreso de lectura de un libro

Envío mediante `GET` a:

```text
baseUrl/api/v1/users/reading/:id
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Se requiere cuenta premium activa.
- `:id` es el id del libro cuyo progreso quieres consultar.
- Devuelve `currentPage`, `lastRead` y los datos del libro.

### 8. Actualizar la página de lectura de un libro

Envío mediante `PUT` a:

```text
baseUrl/api/v1/users/reading/:id
```

```javascript
body
{
  "currentPage": 45
}
```

- Se requiere de headers con el token de sesión para identificar el usuario en la base de datos.
- Se requiere cuenta premium activa.
- El libro debe estar previamente en la lista de lectura actual del usuario.
- Se valida que `currentPage` no supere el número total de páginas del libro (`pages`), comprobado siempre contra el dato guardado en el servidor, no contra ningún valor enviado por el cliente.
- Actualiza también `lastRead` a la fecha actual.