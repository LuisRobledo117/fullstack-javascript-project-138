import axios from "axios";
import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import { get } from "http";
import debug from 'debug';

const log = debug('page-loader');

export const getFileName = (url) => {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    + '.html';
};

const processResources =(html, url, outputDir) => {
  const $ = cheerio.load(html);

  const dirName = getFileName(url).replace('.html', '_files');
  const dirPath = path.join(outputDir, dirName);
  log(`Procesando recursos de: ${url}`);
  log(`Carpeta de recursos: ${dirPath}`);

  const elements = [
    ...$('img').toArray(),
    ...$('link').toArray(),
    ...$('script').toArray(),
  ];

  return fs.mkdir(dirPath, { recursive: true })
    .then(() => {
      log(`Carpeta creada: ${dirPath}`);

      const promises = elements.map((element) => {
        const tag = element.name;
        log(`Revisando elemento <${tag}>`);

        if (tag === 'link' && $(element).attr('rel') !== 'stylesheet') {
          return null;
        }

        const attr = tag === 'link' ? 'href' : 'src';
        const value = $(element).attr(attr);
        
        if(!value) {
          log(`Elemento sin atributo válido, ignorado.`);
          return null;
        };

        const resourceUrl = new URL(value, url).href;

        const isLocal = new URL(resourceUrl).hostname === new URL(url).hostname;
        log(`URL encontrada: ${resourceUrl}`);

        if (!isLocal) {
          log(`Recurso externo ignorado: ${resourceUrl}`);
          return null;
        }

        const ext = path.extname(resourceUrl);
        const fileName = getFileName(resourceUrl).replace('.html', ext);
        const filePath = path.join(dirPath, fileName);
        log(`Descargando recurso: ${resourceUrl}`);

        return axios.get(resourceUrl, { responseType: 'arraybuffer' })
          .then((response) => {
            log(`Guardando recurso en: ${filePath}`);
             return fs.writeFile(filePath, response.data)
          })
          .then(() => {
            log(`Reemplazando ruta en HTML: ${fileName}`);
            $(element).attr(attr, `${dirName}/${fileName}`);
          });
      });

      return Promise.all(promises.filter(Boolean)).then(() =>  {
        log(`Procesamiento de recursos finalizado`);
        return $.html()
      });
    });
};

const pageLoader = (url, outputDir = process.cwd()) => {
    log(`Iniciando descarga de: ${url}`);
    const fileName = getFileName(url);
    const filePath = path.join(outputDir, fileName);
    
    return fs.mkdir(outputDir, { recursive: true })
    .then(() => {
      log(`Directorio de salida: ${outputDir}`);
      return axios.get(url);
    })
    .then((response) => {
      log(`Página descargada correctamente: ${url}`);
      log(`Contenido de la página: ${response.data.length} caracteres`);
      const html = response.data;
      return processResources(html, url, outputDir);
    }).then((processedHtml) => { 

      log(`Guardando archivo HTML...`);

      return fs.writeFile(filePath, processedHtml);
    }).then(() => {
      log(`Archivo guardado en: ${filePath}`);

      return filePath
    }).catch((error) => {
      throw new Error(`Error: ${error.message}`);
    });
};

export default pageLoader; 