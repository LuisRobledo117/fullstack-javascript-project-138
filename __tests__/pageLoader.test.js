import { jest } from '@jest/globals';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader from '../src/index.js';
import { getFileName } from '../src/index.js';
import { fileURLToPath } from 'url';

afterEach(() => {
  jest.restoreAllMocks();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) =>
  path.join(__dirname, '__fixture__', filename);

const readFixture = (filename) =>
  fs.readFile(getFixturePath(filename), 'utf8');

let tempDir;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('descarga y guarda pagina', async () => {
  const url = 'https://codica.la/cursos';
  const html = await readFixture('page_1.html');
  nock('https://codica.la').get('/cursos').reply(200, html);

  const filePath = await pageLoader(url, tempDir);
  const content = await fs.readFile(filePath, 'utf8');
  expect(content).toContain('<h1>Hello</h1>');
});

test('genera nombre correcto', () => {
  const url = 'https://codica.la/cursos';

  const fileName = getFileName(url);

  expect(fileName).toBe('codica-la-cursos.html');
});

test('descargar imagen y modificar HTML', async () => {
  const url = 'https://codica.la/cursos';

  const html = await readFixture('page_2.html');

  nock('https://codica.la').get('/cursos').reply(200, html);

  nock('https://codica.la').get('/assets/test.png').reply(200, 'fake-image-data');

  const filePath = await pageLoader(url, tempDir);

  const content = await fs.readFile(filePath, 'utf8');

  expect(content).toContain('_files/');
  expect(content).toContain('.png');

  const files = await fs.readdir(tempDir);
  const filesDir = files.find((file) => file.includes('_files'));

  expect(filesDir).toBeTruthy();

  const dirPath = path.join(tempDir, filesDir);

  const images = await fs.readdir(dirPath);

  expect(images.length).toBe(1);
});

test('maneja páginas sin imágenes', async () => {
  const url = 'https://codica.la/cursos';

  const html = await readFixture('page_1.html');

  nock('https://codica.la')
    .get('/cursos')
    .reply(200, html);

  const filePath = await pageLoader(url, tempDir);

  const content = await fs.readFile(filePath, 'utf-8');

  expect(content).toContain('<h1>Hello</h1>');
});

test('descarga de recursos locales y modifica HTML', async () => {
  const url = 'https://codica.la/cursos';

  const html = await readFixture('pageWithResources.html');

  nock('https://codica.la')
    .get('/cursos')
    .reply(200, html);

  nock('https://codica.la')
    .get('/assets/test.png')
    .reply(200, 'image-data');

  nock('https://codica.la')
    .get('/assets/application.css')
    .reply(200, 'css-data');

  nock('https://codica.la')
    .get('/packs/app.js')
    .reply(200, 'js-data');

  const filePath = await pageLoader(url, tempDir);

  const content = await fs.readFile(filePath, 'utf-8');

  expect(content).toContain('_files/');
  expect(content).toContain('.png');
  expect(content).toContain('.css');
  expect(content).toContain('.js');

  const files = await fs.readdir(tempDir);

  const resourcesDir = files.find((file) => file.includes('_files'));

  expect(resourcesDir).toBeTruthy();

  const dirPath = path.join(tempDir, resourcesDir);

  const resources = await fs.readdir(dirPath);

  expect(resources.length).toBe(3);

});

test('maneja error de red', async () => {
  const url = 'https://codica.la/cursos';

  nock('https://codica.la')
    .get('/cursos')
    .replyWithError('Network error');

  await expect(pageLoader(url, tempDir))
    .rejects.toThrow('Error: Network error');
});

test('maneja error 404', async () => {
  const url = 'https://codica.la/cursos';

  nock('https://codica.la')
    .get('/cursos')
    .reply(404);

  await expect(pageLoader(url, tempDir))
    .rejects.toThrow();
});

test('maneja error de escritura', async () => {
  const url = 'https://codica.la/cursos';

  nock('https://codica.la')
    .get('/cursos')
    .reply(200, '<html></html>');

  jest.spyOn(fs, 'writeFile')
    .mockRejectedValue(new Error('Permission denied'));

  await expect(pageLoader(url, '__fixtures__'))
    .rejects.toThrow('Permission denied');
});
