const fetch = require('node-fetch');

const baseUrl = 'https://api.figma.com';

module.exports = {
  loadCanvas,
  loadVectorListImages,
  loadVectors,
  loadNodes,
  loadRefImages,
  loadNodeImages,
  getHeaders
};

function getHeaders(devToken) {
  const headers = new fetch.Headers();
  headers.append('X-Figma-Token', devToken);
  return headers;
}

async function loadCanvas(fileKey, headers) {
  let resp = await fetch(`${baseUrl}/v1/files/${fileKey}?geometry=paths`, { headers });
  let data = await resp.json();
  const document = data.document;
  const canvas = document.children[0];
  return canvas;
}

async function loadNodes(ids, fileKey, headers) {
  let resp = await fetch(`${baseUrl}/v1/files/${fileKey}/nodes?geometry=paths&ids=${ids.join(',')}`, { headers });
  let data = await resp.json();
  return data.nodes;
}

async function loadNodeImages({ imageMap, fileKey, headers, options }) {
  const { imageScale, imageFormat } = options;
  const guids = Object.keys(imageMap).join(',');
  data = await fetch(`${baseUrl}/v1/images/${fileKey}?ids=${guids}&use_absolute_bounds=true&format=${imageFormat}&scale=${imageScale}`, {
    headers
  });
  const json = await data.json();
  return json.images || {};
}

async function loadRefImages({ fileKey, headers }) {
  data = await fetch(`${baseUrl}/v1/files/${fileKey}/images`, { headers });
  const json = await data.json();
  return json.meta.images || {};
}

async function loadVectorListImages({ vectorMap, fileKey, headers }) {
  const guids = Object.keys(vectorMap).join(',');
  data = await fetch(`${baseUrl}/v1/images/${fileKey}?ids=${guids}&format=svg`, { headers });
  const json = await data.json();
  return json.images || {};
}

async function loadVectors(shared) {
  const { headers } = shared;

  const vectors = await loadVectorListImages(shared);

  let promises = [];
  let guids = [];

  for (const guid in vectors) {
    if (vectors[guid] == null) continue;
    guids.push(guid);
    promises.push(fetch(vectors[guid], { headers }));
  }

  let responses = await Promise.all(promises);
  promises = [];
  for (const resp of responses) {
    promises.push(resp.text());
  }

  responses = await Promise.all(promises);
  for (let i = 0; i < responses.length; i++) {
    vectors[guids[i]] = responses[i].replace('<svg ', '<svg preserveAspectRatio="none" ');
  }

  return vectors;
}
