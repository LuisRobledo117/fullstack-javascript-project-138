import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import debug from 'debug';
import { Listr } from 'listr2';

const log = debug('page-loader');

export const getFileName = (url) => {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    + '.html';
};

const processResources = (html, url, outputDir) => {
  const $ = cheerio.load(html);

  const dirName = getFileName(url).replace('.html', '_files');
  const dirPath = path.join(outputDir, dirName);

  const baseHost = new URL(url).hostname;

  const elements = [
    ...$('img').toArray(),
    ...$('link').toArray(),
    ...$('script').toArray(),
  ];

  return fs.mkdir(dirPath, { recursive: true })
    .then(() => {

      const tasks = elements.map((element) => {
        const tag = element.name;

        const attr = tag === 'link' ? 'href' : 'src';
        const value = $(element).attr(attr);

        if (!value) return null;

        const resourceUrl = new URL(value, url).href;
        const resourceHost = new URL(resourceUrl).hostname;

        const isLocal =
          resourceHost === baseHost ||
          resourceHost.endsWith(`.${baseHost}`);

        if (!isLocal) return null;

        const cleanUrl = resourceUrl.split('?')[0];
        const ext = path.extname(cleanUrl) || '.html';
        const fileName = getFileName(cleanUrl).replace('.html', ext);
        const filePath = path.join(dirPath, fileName);

        return {
          title: `Descargando: ${resourceUrl}`,
          task: () => axios.get(resourceUrl, { responseType: 'arraybuffer' })
            .then((response) => {
              return fs.writeFile(filePath, response.data);
            })
            .then(() => {
              $(element).attr(attr, `${dirName}/${fileName}`);
            })
            .catch((error) => {
              log(`Error descargando ${resourceUrl}: ${error.message}`);
            }),
        };
      }).filter(Boolean);

      if (process.env.NODE_ENV === 'test') {
        return Promise.all(tasks.map((t) => t.task()))
          .then(() => $.html());
      }

      const listr = new Listr(tasks, {
        concurrent: true,
        exitOnError: false,
      });

      return listr.run()
        .then(() => $.html());
    });
};

const pageLoader = (url, outputDir = process.cwd()) => {
  log(`Iniciando descarga de: ${url}`);
  const fileName = getFileName(url);
  const filePath = path.join(outputDir, fileName);

  return fs.access(outputDir)
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

      log('Guardando archivo HTML...');

      return fs.writeFile(filePath, processedHtml);
    }).then(() => {
      log(`Archivo guardado en: ${filePath}`);

      return filePath;
    }).catch((error) => {
      throw new Error(`Error: ${error.message}`);
    });
};

export default pageLoader;
