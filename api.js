const fetch = require('node-fetch');

const baseUrl = 'https://api.figma.com';

module.exports = {
  loadCanvas,
  loadURLImages,
  loadImages,
  loadNodes,
  loadURLPNGImages,
  loadPNGImages,
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

async function loadURLImages(vectorList, fileKey, headers) {
  const guids = vectorList.join(',');
  data = await fetch(`${baseUrl}/v1/images/${fileKey}?ids=${guids}&format=svg`, { headers });
  return await data.json();
}

async function loadPNGImages(imagesList, scale = 1, fileKey, imageFormat, headers) {
  const guids = imagesList.join(',');
  data = await fetch(`${baseUrl}/v1/images/${fileKey}?ids=${guids}&use_absolute_bounds=true&format=${imageFormat || 'svg'}&scale=${scale}`, { headers });
  const json = await data.json();
  return json.images;
}

async function loadURLPNGImages(fileKey, headers) {
  data = await fetch(`${baseUrl}/v1/files/${fileKey}/images`, { headers });
  const json = await data.json();
  return json.meta.images;
}

async function loadImages(imageJSON) {
  const images = imageJSON.images || {};
  if (images) {
    let promises = [];
    let guids = [];

    for (const guid in images) {
      if (images[guid] == null) continue;
      guids.push(guid);
      promises.push(fetch(images[guid]));
    }

    let responses = await Promise.all(promises);
    promises = [];
    for (const resp of responses) {
      promises.push(resp.text());
    }

    responses = await Promise.all(promises);
    for (let i = 0; i < responses.length; i++) {
      images[guids[i]] = responses[i].replace('<svg ', '<svg preserveAspectRatio="none" ');
    }
  }
  return images;
}
