const fetch = require('node-fetch');
const { colorString, getElementParams } = require('./lib');

const baseUrl = 'https://api.figma.com';

module.exports = {
  loadCanvas,
  loadVectorListImages,
  loadVectors,
  loadNodes,
  loadRefImages,
  loadListImages,
  loadNodeImages,
  getHeaders
};

function getHeaders(devToken) {
  const headers = new fetch.Headers();
  headers.append('X-Figma-Token', devToken);
  return headers;
}

async function loadCanvas(fileKey, headers) {
  const resp = await fetch(`${baseUrl}/v1/files/${fileKey}?geometry=paths`, { headers });
  const data = await resp.json();
  const document = data.document;
  if (data.err) {
    throw new Error(data.err);
  }
  const canvas = document.children[0];
  return canvas;
}

async function loadNodes(ids, fileKey, headers) {
  if (ids.length > 0) {
    const resp = await fetch(`${baseUrl}/v1/files/${fileKey}/nodes?geometry=paths&ids=${ids.join(',')}`, { headers });
    const data = await resp.json();
    if (data.err) {
      throw new Error(data.err);
    }
    return data.nodes;
  } else {
    return {};
  }
}

async function loadNodeImages({ imageMap, fileKey, headers, options }) {
  const { imageScale, imageFormat } = options;
  if (Object.keys(imageMap).length > 0) {
    const guids = Object.keys(imageMap).join(',');
    const resp = await fetch(
      `${baseUrl}/v1/images/${fileKey}?ids=${guids}&use_absolute_bounds=true&format=${imageFormat}&scale=${imageScale}`,
      {
        headers
      }
    );
    const data = await resp.json();
    if (data.err) {
      throw new Error(data.err);
    }
    return data.images || {};
  } else {
    return {};
  }
}

async function loadRefImages({ fileKey, headers }) {
  const resp = await fetch(`${baseUrl}/v1/files/${fileKey}/images`, { headers });
  const data = await resp.json();
  if (data.err) {
    throw new Error(data.err);
  }
  return data.meta.images || {};
}

async function loadListImages({ fileKey, headers, options }, guids, format = 'svg', absolute = false, scale = null) {
  if (guids.length > 0) {
    const { imageScale } = options;
    scale = scale || imageScale;
    const resp = await fetch(
      `${baseUrl}/v1/images/${fileKey}?ids=${guids}&scale=${format === 'svg' ? 1 : imageScale}&format=${format}${
        absolute ? '&use_absolute_bounds=true' : ''
      }`,
      {
        headers
      }
    );
    const data = await resp.json();
    if (data.err) {
      throw new Error(data.err);
    }
    return data.images || {};
  } else {
    return {};
  }
}

async function loadVectorListImages(shared, format = 'svg', absolute = false) {
  const { vectorMap } = shared;
  return loadListImages(shared, Object.keys(vectorMap).join(','), format, absolute);
}

async function loadVectors(shared) {
  const { headers } = shared;

  const vectors = await loadVectorListImages(shared, 'svg', true);
  const vectorsRelative = await loadVectorListImages(shared, 'svg', false);

  let promises = [];
  const guids = [];

  for (const guid in vectors) {
    if (vectors[guid] == null) vectors[guid] = vectorsRelative[guid];
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

  // for (const guid in vectorMap) {
  //   if (!vectors[guid]) {
  //     const node = vectorMap[guid];
  //     let svg = '<svg preserveAspectRatio="none">';
  //     let color = '#ffffff';
  //     if (node.fills && node.fills.length > 0) {
  //       for (const fill of node.fills) {
  //         if (fill.type === 'SOLID') {
  //           color = colorString(fill.color);
  //         }
  //       }
  //     }
  //     if (node.fillGeometry && node.fillGeometry.length > 0) {
  //       for (const fill of node.fillGeometry) {
  //         svg += `<path d="${fill.path}" fill="${color}"></path>`;
  //       }
  //     }
  //     svg += '</svg>';
  //     vectors[guid] = svg;
  //   }
  // }

  return vectors;
}
