import axios from "axios";
import fs from 'fs/promises';
import path from 'path';

export const getFileName = (url) => {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    + '.html';
};

const pageLoader = (url, outputDir = process.cwd()) => {
    const fileName = getFileName(url);
    const filePath = path.join(outputDir, fileName);
    
    return fs.mkdir(outputDir, { recursive: true })
    .then(() => axios.get(url))
    .then((response) => {
      const html = response.data;
      return fs.writeFile(filePath, html)
    }).then(() => filePath);
};

export default pageLoader; 