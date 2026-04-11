import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader from '../src/index.js';
import { getFileName } from '../src/index.js';

let tempDir;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('descarga y guarda pagina', async () => {
  const url = 'https://codica.la/cursos';
  const html = '<html><body><h1>Hello</h1></body></html>';
  nock('https://codica.la').get('/cursos').reply(200, html);

  const filePath = await pageLoader(url, tempDir);
  const content = await fs.readFile(filePath, 'utf8');
  expect(content).toBe(html);
});

test('genera nombre correcto', () => {
  const url = 'https://codica.la/cursos';

  const fileName = getFileName(url);

  expect(fileName).toBe('codica-la-cursos.html');
});