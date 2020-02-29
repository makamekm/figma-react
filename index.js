require('dotenv').config();

const { preprocessCanvasComponents, createComponents, generateComponent } = require('./lib');
const { loadCanvas, loadNodes, loadVectors, loadRefImages, loadNodeImages, getHeaders } = require('./api');
const presets = require('./presets');

function getConfig(options = {}) {
  let fileKey = options.fileKey || process.argv[2] || process.env.FIGMA_FILE_KEY;
  let devToken = options.devToken || process.argv[3] || process.env.FIGMA_DEV_TOKEN;
  let presetName = process.argv[4] || process.env.FIGMA_PRESET || 'default';

  if (!fileKey || !devToken) {
    console.log(
      'Usage: figma-react <file-key> [figma-dev-token] <preset-name> or use env.FIGMA_FILE_KEY, env.FIGMA_DEV_TOKEN, process.env.FIGMA_PRESET'
    );
    process.exit(0);
  }

  Object.assign(options, presets[presetName]);

  options.dir = options.dir || process.env.FIGMA_DIR;
  options.makeDir = options.makeDir == null ? !!process.env.FIGMA_MAKE_DIR : options.makeDir;

  const headers = getHeaders(devToken);

  return {
    headers,
    fileKey
  };
}

async function runFigmaReact(options = {}) {
  const { headers, fileKey } = getConfig(options);

  // Create shared objects
  const vectorMap = {};
  const imageMap = {};
  const componentMap = {};
  const componentDescriptionMap = {};

  const shared = {
    componentMap,
    componentDescriptionMap,
    vectorMap,
    imageMap,
    options,
    fileKey,
    headers
  };

  // Load the document from Figma
  const canvas = await loadCanvas(fileKey, headers);

  // Debug
  const fs = require('fs');
  fs.writeFileSync('./temp.json', JSON.stringify(canvas, null, 4));

  // Wrap vectors and images
  preprocessCanvasComponents(canvas, shared);

  // Load component description
  const nodes = await loadNodes(Object.keys(componentDescriptionMap), fileKey, headers);

  for (const id in nodes) {
    componentDescriptionMap[id] = nodes[id].components[id].description;
  }

  // Load all images used in the document from Figma
  shared.vectors = await loadVectors(shared);
  shared.refImages = await loadRefImages(shared);
  shared.images = await loadNodeImages(shared);

  // Create components
  await createComponents(canvas, shared);

  // Generate components
  for (const key in componentMap) {
    await generateComponent(componentMap[key], options);
  }
}

module.exports = {
  runFigmaReact,
  ...require('./lib'),
  ...require('./api'),
  ...require('./content.plugins'),
  ...require('./style.plugins')
};
