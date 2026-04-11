### Hexlet tests and linter status:
[![Actions Status](https://github.com/LuisRobledo117/fullstack-javascript-project-138/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/LuisRobledo117/fullstack-javascript-project-138/actions)

# Page Loader

Page Loader es una utilidad de línea de comandos (CLI) que descarga una página web y la guarda como archivo HTML en el sistema local.

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

Salida:

/ruta/completa/example-com.html

También puedes especificar un directorio:

page-loader https://example.com -o ./pages

---

## ⚙️ Cómo funciona

1. Recibe una URL desde la línea de comandos
2. Descarga el contenido HTML usando solicitudes HTTP
3. Genera un nombre de archivo basado en la URL
4. Guarda el archivo en el directorio especificado

---

## Ejemplo de transformación de URL

https://codica.la/cursos → codica-la-cursos.html
 # Ejemplo en asciinema

 https://asciinema.org/a/zmgE9vpWJJ4SfcGQ

---

## Tests

Para ejecutar las pruebas:

npm test

Las pruebas utilizan mocking de HTTP para simular descargas sin depender de internet.

---

## Estado del proyecto

✔ Descarga de páginas
✔ Guardado de archivos
✔ CLI funcional
✔ Tests implementados
