let q = require('q');
let assign = require('object-assign');
let parseString = require('xml2js').parseString;
let xmlbuilder = require('xmlbuilder');
let utils = require('./utils.js');

let defaults = {
  passProps: false,
  passChildren: false,
  root: null,
  refs: null
};

function cleanupParsedSVGElement(xpath, previousSibling, element) {
  return {
    tagName: element['#name'],
    attributes: element.$ || {},
    children: element.$$ || [],
    text: element._
  };
}

function parseSVG(svg, callback) {
  parseString(
    svg,
    {
      explicitArray: true,
      explicitChildren: true,
      explicitRoot: false,
      mergeAttrs: false,
      normalize: true,
      normalizeTags: false,
      preserveChildrenOrder: true,
      attrNameProcessors: [utils.processAttributeName],
      validator: cleanupParsedSVGElement
    },
    callback
  );
}

function afterParseSVG(parsedSVG) {
  utils.forEach(parsedSVG, function(element) {
    if (!utils.supportsAllAttributes(element)) {
      element.attributes = utils.sanitizeAttributes(element.attributes);
    }

    element.children = utils.sanitizeChildren(element.children);
  });

  return parsedSVG;
}

function formatElementForXMLBuilder(element) {
  let attributes = element.attributes;
  let children = element.children && element.children.map(formatElementForXMLBuilder);

  let result = Object.keys(attributes).reduce(function(hash, name) {
    hash['@' + name] = attributes[name];

    return hash;
  }, {});

  if (element.text) result['#text'] = element.text;

  if (children && children.length) {
    children.forEach(function(child) {
      let tagName = Object.keys(child)[0];
      let existingValue = result[tagName];
      if (existingValue) {
        if (Array.isArray(existingValue)) {
          // existing element array, push new element
          existingValue.push(child[tagName]);
        } else {
          // create array with existing and new elements
          result[tagName] = [existingValue, child[tagName]];
        }
      } else {
        // first child element with this tag name
        result[tagName] = child[tagName];
      }
    });
  }

  let wrapped = {};
  wrapped[element.tagName] = result;

  return wrapped;
}

function beforeBuildSVG(options, parsed) {
  if (options.root) {
    let root = utils.findById(parsed, options.root);
    if (!root) throw new Error('Cannot find root element #' + options.root);

    parsed = root;
  }

  if (options.refs) {
    Object.keys(options.refs).forEach(function(id) {
      let ref = options.refs[id];

      let element = utils.findById(parsed, id);
      if (!element) throw new Error('Cannot find element #' + id + ' for ref ' + ref);

      element.attributes.ref = ref;
    });
  }

  if (options.passProps) {
    parsed.attributes.passProps = 1;
  }

  if (options.renderChildren) {
    let passChildrenToSpecificId = typeof options.renderChildren === 'string';
    let passChildrenTo = passChildrenToSpecificId ? utils.findById(parsed, options.renderChildren) : parsed;

    if (!passChildrenTo) throw new Error('Cannot find element #' + options.renderChildren + ' to render children into');

    passChildrenTo.text = [passChildrenTo.text || '', '{this.props.children}'].join('\n');
  }

  return formatElementForXMLBuilder(parsed);
}

function afterBuildSVG(built) {
  return built
    .replace(/style="((?:[^"\\]|\\.)*)"/gi, function(matched, styleString) {
      let style = styleString
        .split(/\s*;\s*/g)
        .filter(Boolean)
        .reduce(function(hash, rule) {
          let keyValue = rule.split(/\s*\:\s*(.*)/);
          let property = utils.cssProperty(keyValue[0]);
          let value = keyValue[1];

          hash[property] = value;

          return hash;
        }, {});

      return 'style={' + JSON.stringify(style) + '}';
    })
    .replace(/passProps="1"/, '{...this.props}');
}

function buildSVG(object) {
  return xmlbuilder.create(object, { headless: true }).end({ pretty: true, indent: '\t', newline: '\n' });
}

module.exports = function svgToJsx(svg, options, callback) {
  if (arguments.length === 2) {
    callback = options;
    options = {};
  }

  options = assign({}, defaults, options);

  let promise = q
    .nfcall(parseSVG, svg)
    .then(afterParseSVG)
    .then(beforeBuildSVG.bind(null, options))
    .then(buildSVG)
    .then(afterBuildSVG);

  if (callback) {
    promise.done(
      function(result) {
        callback(null, result);
      },
      function(error) {
        callback(error, null);
      }
    );
  }

  return promise;
};
