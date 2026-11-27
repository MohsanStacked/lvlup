import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../src/domain.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
export const { retreatMatches, validateEnquiry, validateMedia, isMediaSource } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
