import axios from "axios";
import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import { dir } from "console";

export const getFileName = (url) => {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    + '.html';
};

const processImages =(html, url, outputDir) => {
  const $ = cheerio.load(html);

  const dirName = getFileName(url).replace('.html', '_files');
  const dirPath = path.join(outputDir, dirName);

  const images = $('img');

  return fs.mkdir(dirPath, { recursive: true })
    .then(() => {
      const promises = [];

      images.each((i, element) => {
        const src = $(element).attr('src');

        if (!src) return;

        const imageUrl = new URL(src, url).href;

        const imageName = getFileName(imageUrl).replace('.html', '.png');

        const filePath = path.join(dirPath, imageName);

        const promise = axios.get(imageUrl, { responseType: 'arraybuffer' })
          .then((response) => fs.writeFile(filePath, response.data))
          .then(() => {
            $(element).attr('src', `${dirName}/${imageName}`);
          });

        promises.push(promise);
      });

      return Promise.all(promises).then(() => $.html());
    });
};

const pageLoader = (url, outputDir = process.cwd()) => {
    const fileName = getFileName(url);
    const filePath = path.join(outputDir, fileName);
    
    return fs.mkdir(outputDir, { recursive: true })
    .then(() => axios.get(url))
    .then((response) => {
      const html = response.data;
      
      return processImages(html, url, outputDir);
    }).then((processedHtml) => { return fs.writeFile(filePath, processedHtml);

    }).then(() => filePath);
};

export default pageLoader; 