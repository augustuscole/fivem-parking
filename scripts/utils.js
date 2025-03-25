import { readFile, stat, writeFile } from 'fs/promises';

export async function generateManifest({ client, server, files, dependencies, metadata }) {
  const data = await getJson('package.json');
  const fxmanifest = {
    fx_version: 'cerulean',
    game: 'gta5',
    name: data.name,
    description: data.description,
    author: data.author,
    version: data.version,
    repository: data.repository?.url,
    license: data.license,
    ...(metadata || {}),
  };

  let output = [];
  for (const [key, value] of Object.entries(fxmanifest)) {
    if (value) {
      output.push(`${key} '${value}'`);
    }
  }

  const append = (type, option) => {
    if (option?.length > 0) {
      output.push(
        `\n${type}${type === 'dependencies' || type === 'files' ? '' : '_scripts'} {${option.map((item) => `\n\t'${item}'`).join(',')}\n}`,
      );
    }
  };

  append('client', client);
  append('server', server);
  append('files', files);
  append('dependencies', dependencies);

  await writeFile('fxmanifest.lua', output.join('\n'));
}

export async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (err) {}

  return false;
}

export async function getUtf8(path) {
  return await readFile(path, 'utf8');
}

export async function getJson(path) {
  return JSON.parse(await getUtf8(path));
}
