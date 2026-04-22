### Hexlet tests and linter status:
[![Actions Status](https://github.com/LuisRobledo117/fullstack-javascript-project-138/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/LuisRobledo117/fullstack-javascript-project-138/actions)

# Page Loader

es una utilidad de línea de comandos que descarga páginas web y sus recursos locales (imágenes, CSS y JavaScript) para permitir su visualización offline.

El programa:
- Descarga el HTML de una página
- Guarda los recursos locales en una carpeta
- Reemplaza las rutas en el HTML
- Muestra el progreso de descarga en la terminal

## Instalación

Clona el repositorio y ejecuta:

npm install

Luego instala el paquete globalmente:

npm link

---

## Uso

page-loader [options] <url>

### Options:

* `-o, --output <dir>`: especifica el directorio donde se guardará el archivo (por defecto, el directorio actual)
* `-h, --help`: muestra ayuda
* `-V, --version`: muestra la versión

---

## Ejemplo de uso

page-loader https://example.com

Descarga de página:

🔹 Descarga con recursos (imágenes, CSS, JS)

🔹 Progreso de descarga (Listr)

🔹 Manejo de errores

También puedes especificar un directorio:

page-loader https://example.com -o ./pages

---

## Cómo funciona

1. Se descarga el HTML de la página
2. Se analizan los recursos con Cheerio
3. Se filtran solo recursos locales
4. Se descargan en paralelo
5. Se actualizan las rutas en el HTML
6. Se guarda el archivo final

---

## Manejo de errores

El programa:

- Muestra errores en stderr
- Finaliza con código de salida distinto de 0
- Maneja fallos de red y escritura
- Continúa si falla la descarga de un recurso individual

## Ejemplo de transformación de URL

 https://codica.la/cursos → codica-la-cursos.html

Ejemplos con asciinema:

* Transformacion de URL:
  https://asciinema.org/a/zmgE9vpWJJ4SfcGQ

* Prueba descarga de imagenes y modificacion del html:
  https://asciinema.org/a/uVZAhoTMyxbLcJX5

* prueba paso 3 descarga de otros recuros .png .css y .js
  https://asciinema.org/a/NdbWu4DUqyxPnop9

* prueba debug asciinema:
  https://asciinema.org/a/sHJtSai94VvvfZjl

* manejo de errores:
  https://asciinema.org/a/OrSkq8GUbNfLkGC4

* Ejemplo con spinner:
  https://asciinema.org/a/6s18AzxciyeUsuxz

---

## Tests

Para ejecutar las pruebas:

npm test

Las pruebas utilizan mocking de HTTP para simular descargas sin depender de internet.

---

## Tecnologías utilizadas

- Node.js
- Axios
- Cheerio
- Listr2
- Jest
- Nock
- Debug

## Estructura del proyecto

src/
  index.js
bin/
  page-loader.js
__tests__/
  pageLoader.test.js

## Autor
Luis Robledo