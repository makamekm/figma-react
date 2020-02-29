const fetch = require('node-fetch');
const { colorString } = require('./lib');

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

async function loadVectorListImages({ vectorMap, fileKey, headers }, absolute = false) {
  const guids = Object.keys(vectorMap).join(',');
  const resp = await fetch(`${baseUrl}/v1/images/${fileKey}?ids=${guids}&format=svg${absolute ? '&use_absolute_bounds=true' : ''}`, { headers });
  const data = await resp.json();
  if (data.err) {
    throw new Error(data.err);
  }
  return data.images || {};
}

async function loadVectors(shared) {
  const { headers, vectorMap } = shared;

  const vectors = await loadVectorListImages(shared, true);
  const vectorsRelative = await loadVectorListImages(shared, false);

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
