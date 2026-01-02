const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));

const apis = [];
let idCounter = 1;

Object.keys(swagger.paths).forEach(path => {
    const methods = swagger.paths[path];
    Object.keys(methods).forEach(method => {
        const details = methods[method];
        apis.push({
            id: String(idCounter++),
            name: details.summary || details.operationId || 'Unnamed API',
            group: details.tags ? details.tags[0] : 'General',
            method: method.toUpperCase(),
            url: path,
            description: details.summary || '',
            isActive: true,
            defaultBody: ['POST', 'PUT'].includes(method.toUpperCase()) ? '{}' : undefined
        });
    });
});

const fileContent = `import { ApiEndpoint } from './api-config-types';

export const DEFAULT_APIS: ApiEndpoint[] = ${JSON.stringify(apis, null, 4)};`;

fs.writeFileSync('src/lib/default-apis.ts', fileContent);
console.log('Defaults generated.');
