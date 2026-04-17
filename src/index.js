import axios from "axios";
import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import { get } from "http";

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

  const elements = [
    ...$('img').toArray(),
    ...$('link').toArray(),
    ...$('script').toArray(),
  ];

  return fs.mkdir(dirPath, { recursive: true })
    .then(() => {
      const promises = elements.map((element) => {
        const tag = element.name;

        if (tag === 'link' && $(element).attr('rel') !== 'stylesheet') {
          return null;
        }

        const attr = tag === 'link' ? 'href' : 'src';
        const value = $(element).attr(attr);
        
        if(!value) return null;

        const resourceUrl = new URL(value, url).href;

        const isLocal = new URL(resourceUrl).hostname === new URL(url).hostname;

        if (!isLocal) return null;

        const ext = path.extname(resourceUrl);
        const fileName = getFileName(resourceUrl).replace('.html', ext);
        const filePath = path.join(dirPath, fileName);

        return axios.get(resourceUrl, { responseType: 'arraybuffer' })
          .then((response) => fs.writeFile(filePath, response.data))
          .then(() => {
            $(element).attr(attr, `${dirName}/${fileName}`);
          });
      });

      return Promise.all(promises.filter(Boolean)).then(() => $.html());
    });
};

const pageLoader = (url, outputDir = process.cwd()) => {
    const fileName = getFileName(url);
    const filePath = path.join(outputDir, fileName);
    
    return fs.mkdir(outputDir, { recursive: true })
    .then(() => axios.get(url))
    .then((response) => {
      const html = response.data;
      
      return processResources(html, url, outputDir);
    }).then((processedHtml) => { return fs.writeFile(filePath, processedHtml);

    }).then(() => filePath);
};

export default pageLoader; 