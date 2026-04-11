#!/usr/bin/env node

import { Command } from 'commander';
import pageLoader from '../src/index.js';

const program = new Command();

program.name('page-loader')
    .description('page loader utility')
    .version('1.0.0')
    .argument('<url>')
    .option('-o, --output <dir>', 'output dir', process.cwd())
    .action((url, options) => {
        const outputDir = options.output;
pageLoader(url, outputDir).then((filePath) => {
    console.log(filePath);
}).catch((error) => {
    console.error(`Error al descargar la página: ${error.message}`);
    process.exit(1);
});
    });

program.parse(process.argv);