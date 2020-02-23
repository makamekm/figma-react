const requestImageSize = require('request-image-size');
const fetch = require('node-fetch');
const { colorString, dropShadow, innerShadow, getPaint, paintToLinearGradient, paintToRadialGradient, applyFontStyle } = require('./lib');

const stylePlugins = [
  setMiddleOrder,
  setTransformation,
  setHorizontalAlign,
  setVerticalAlign,
  setHorizontalLayout,
  setFrameStyles,
  setTextRenderer
];

module.exports = {
  stylePlugins,
  setMiddleOrder,
  setTransformation,
  setHorizontalAlign,
  setVerticalAlign,
  setHorizontalLayout,
  setFrameStyles,
  setTextRenderer
};

function setMiddleOrder({ node, middleStyle }) {
  if (node.order) {
    middleStyle.zIndex = node.order;
  }
}

function setTransformation({ middleStyle, bounds, node }) {
  if (node.type !== 'VECTOR') {
    if (bounds && Math.abs(bounds.angle) > 0.01) {
      middleStyle.transform = `rotate(${-bounds.angle}deg)`;
      middleStyle.transformOrigin = '50% 50%';
    }
  }
}

function setHorizontalAlign({ node, middleStyle, outerStyle, bounds }) {
  const cHorizontal = node.constraints && node.constraints.horizontal;
  middleStyle.debugH = cHorizontal;
  if (bounds && bounds.width && cHorizontal !== 'LEFT_RIGHT' && cHorizontal !== 'SCALE') middleStyle.width = bounds.width;
  if (cHorizontal === 'LEFT_RIGHT') {
    if (bounds != null) {
      outerStyle.position = 'relative';
      outerStyle.display = 'flex';
      outerStyle.pointerEvents = 'none';
      outerStyle.justifyContent = 'stretch';
      if (bounds != null) {
        middleStyle.marginLeft = bounds.left;
        middleStyle.marginRight = bounds.right;
        middleStyle.flexGrow = 1;
      }
    }
  } else if (cHorizontal === 'RIGHT') {
    outerStyle.position = 'relative';
    outerStyle.display = 'flex';
    outerStyle.width = '100%';
    outerStyle.pointerEvents = 'none';
    outerStyle.justifyContent = 'flex-end';
    if (bounds != null) {
      middleStyle.marginRight = bounds.right;
      middleStyle.width = bounds.width;
      middleStyle.minWidth = bounds.width;
    }
  } else if (cHorizontal === 'CENTER') {
    outerStyle.position = 'relative';
    outerStyle.display = 'flex';
    outerStyle.width = '100%';
    outerStyle.pointerEvents = 'none';
    outerStyle.justifyContent = 'center';
    if (bounds != null) {
      middleStyle.width = bounds.width;
      middleStyle.marginLeft = bounds.left && bounds.right ? bounds.left - bounds.right : null;
    }
  } else if (cHorizontal === 'SCALE') {
    outerStyle.position = 'relative';
    outerStyle.display = 'flex';
    outerStyle.width = '100%';
    outerStyle.pointerEvents = 'none';
    outerStyle.justifyContent = 'center';
    if (bounds != null) {
      const parentWidth = bounds.left + bounds.width + bounds.right;
      middleStyle.width = `${(bounds.width * 100) / parentWidth}%`;
      middleStyle.marginLeft = `${(bounds.left * 100) / parentWidth}%`;
    }
  } else {
    if (bounds != null) {
      outerStyle.position = 'relative';
      outerStyle.display = 'flex';
      middleStyle.marginLeft = bounds.left;
      middleStyle.width = bounds.width;
      middleStyle.minWidth = bounds.width;
    }
  }
}

function setVerticalAlign({ node, middleStyle, outerStyle, bounds }) {
  const cVertical = node.constraints && node.constraints.vertical;
  middleStyle.debugV = cVertical;
  if (bounds && bounds.height && cVertical !== 'TOP_BOTTOM') middleStyle.height = bounds.height;
  if (cVertical === 'TOP_BOTTOM') {
    outerStyle.width = '100%';
    outerStyle.pointerEvents = 'none';
    outerStyle.position = 'absolute';
    outerStyle.height = '100%';
    outerStyle.top = 0;
    outerStyle.left = 0;
    outerStyle.alignItems = 'stretch';
    if (bounds != null) {
      middleStyle.position = 'relative';
      middleStyle.marginTop = bounds.top;
      middleStyle.marginBottom = bounds.bottom;
    }
  } else if (cVertical === 'CENTER') {
    outerStyle.position = 'relative';
    outerStyle.display = 'flex';
    outerStyle.width = '100%';
    outerStyle.pointerEvents = 'none';
    outerStyle.alignItems = 'center';
    outerStyle.position = 'absolute';
    outerStyle.height = '100%';
    outerStyle.top = 0;
    outerStyle.left = 0;
    outerStyle.alignItems = 'center';
    if (bounds != null) {
      middleStyle.position = 'relative';
      middleStyle.marginTop = bounds.top - bounds.bottom;
    }
  } else if (cVertical === 'SCALE') {
    outerStyle.position = 'relative';
    outerStyle.display = 'flex';
    outerStyle.width = '100%';
    outerStyle.pointerEvents = 'none';
    outerStyle.position = 'absolute';
    outerStyle.height = '100%';
    outerStyle.top = 0;
    outerStyle.left = 0;
    outerStyle.alignItems = 'stretch';
    if (bounds != null) {
      middleStyle.position = 'relative';
      const parentHeight = bounds.top + bounds.height + bounds.bottom;
      middleStyle.height = `${(bounds.height * 100) / parentHeight}%`;
      middleStyle.top = `${(bounds.top * 100) / parentHeight}%`;
    }
  } else if (cVertical === 'BOTTOM') {
    outerStyle.width = '100%';
    outerStyle.pointerEvents = 'none';
    outerStyle.position = 'absolute';
    outerStyle.height = '100%';
    outerStyle.bottom = 0;
    outerStyle.left = 0;
    outerStyle.alignItems = 'flex-end';
    if (bounds != null) {
      middleStyle.position = 'relative';
      middleStyle.marginBottom = bounds.bottom;
    }
  } else {
    if (bounds != null) {
      outerStyle.position = 'relative';
      outerStyle.display = 'flex';
      middleStyle.position = 'relative';
      middleStyle.marginTop = bounds.top;
      middleStyle.marginBottom = bounds.bottom;
      middleStyle.minHeight = middleStyle.height;
      middleStyle.height = null;
    }
  }
}

function setHorizontalLayout({ node, middleStyle, innerStyle, parent, classNames }, { genClassName, additionalStyles }) {
  if (node.layoutMode === 'HORIZONTAL') {
    innerStyle.display = 'flex';
    innerStyle.flexDirection = 'row';
    middleStyle.maxWidth = '100%';
    innerStyle.maxWidth = '100%';
    innerStyle.marginTop = -node.itemSpacing;
    innerStyle.marginLeft = -node.itemSpacing;
    innerStyle.marginRight = -node.itemSpacing;

    const currentClass = genClassName();
    classNames.push(currentClass);

    additionalStyles.push(`
      .${currentClass} > * > * {
        margin-left: ${parent.itemSpacing}px;
        margin-right: ${parent.itemSpacing}px;
        margin-top: ${parent.itemSpacing}px;
        margin-bottom: ${0};
      }
    `);
  }

  if (parent && parent.layoutMode === 'HORIZONTAL') {
    middleStyle.marginLeft = 0;
    middleStyle.marginRight = 0;
    middleStyle.marginTop = 0;
    middleStyle.marginBottom = 0;
  }
}

async function setFrameStyles(state, { pngImages, headers, options }) {
  const { node, middleStyle, props } = state;
  if (['FRAME', 'RECTANGLE', 'INSTANCE', 'COMPONENT'].indexOf(node.type) >= 0) {
    if (['FRAME', 'COMPONENT', 'INSTANCE'].indexOf(node.type) >= 0) {
      middleStyle.backgroundColor = colorString(node.backgroundColor);
      if (node.clipsContent) middleStyle.overflow = 'hidden';
    } else if (node.type === 'RECTANGLE') {
      // TODO: Foreach fills
      const lastFill = getPaint(node.fills);
      if (lastFill && lastFill.visible !== false) {
        if (lastFill.type === 'SOLID') {
          middleStyle.backgroundColor = colorString(lastFill.color);
          middleStyle.opacity = lastFill.opacity;
        } else if (lastFill.type === 'IMAGE') {
          const imageSize = await requestImageSize(pngImages[lastFill.imageRef]);
          if (options.useBase64Images || Object.keys(props).includes('useBase64')) {
            const imageRequest = await fetch(pngImages[lastFill.imageRef], { headers });
            const imageBuffer = await imageRequest.buffer();
            const imageDataURL = `data:${imageRequest.headers.get('content-type')};base64,${imageBuffer.toString('base64')}`;
            middleStyle.backgroundImage = `url(${imageDataURL})`;
          } else {
            middleStyle.backgroundImage = `url(${pngImages[lastFill.imageRef]})`;
          }
          middleStyle.backgroundPosition = 'center center';
          middleStyle.backgroundRepeat = 'no-repeat';
          if (lastFill.scaleMode === 'FILL') {
            middleStyle.backgroundSize = 'cover';
          } else if (lastFill.scaleMode === 'FIT') {
            middleStyle.backgroundSize = 'contain';
          } else if (lastFill.scaleMode === 'TILE') {
            middleStyle.backgroundPosition = 'left top';
            middleStyle.backgroundRepeat = 'repeat';
            middleStyle.backgroundSize = `${lastFill.scalingFactor * imageSize.width}px ${lastFill.scalingFactor * imageSize.height}px`;
          } else if (lastFill.scaleMode === 'STRETCH') {
            middleStyle.backgroundRepeat = 'no-repeat';
            middleStyle.backgroundSize = `100% 100%`;
            middleStyle.backgroundPosition = `-${100 * lastFill.imageTransform[0][2]}% -${100 * lastFill.imageTransform[1][2]}%`;
          }
        } else if (lastFill.type === 'GRADIENT_LINEAR') {
          middleStyle.background = paintToLinearGradient(lastFill);
        } else if (lastFill.type === 'GRADIENT_RADIAL') {
          middleStyle.background = paintToRadialGradient(lastFill);
        }
      }

      if (node.effects) {
        for (let i = 0; i < node.effects.length; i++) {
          const effect = node.effects[i];
          if (effect.type === 'DROP_SHADOW') {
            middleStyle.boxShadow = dropShadow(effect);
          } else if (effect.type === 'INNER_SHADOW') {
            middleStyle.boxShadow = innerShadow(effect);
          } else if (effect.type === 'LAYER_BLUR') {
            middleStyle.filter = `blur(${effect.radius}px)`;
          }
        }
      }

      const lastStroke = getPaint(node.strokes);
      if (lastStroke) {
        if (lastStroke.type === 'SOLID') {
          const weight = node.strokeWeight || 1;
          middleStyle.border = `${weight}px solid ${colorString(lastStroke.color)}`;
        }
      }

      const cornerRadii = node.rectangleCornerRadii;
      if (cornerRadii && cornerRadii.length === 4 && cornerRadii[0] + cornerRadii[1] + cornerRadii[2] + cornerRadii[3] > 0) {
        middleStyle.borderRadius = `${cornerRadii[0]}px ${cornerRadii[1]}px ${cornerRadii[2]}px ${cornerRadii[3]}px`;
      }
    }
  }
}

function setTextRenderer({ node, props, middleStyle, content }, { printStyle }) {
  if (node.type === 'TEXT') {
    const lastFill = getPaint(node.fills);
    if (lastFill) {
      middleStyle.color = colorString(lastFill.color);
    }

    const lastStroke = getPaint(node.strokes);
    if (lastStroke) {
      const weight = node.strokeWeight || 1;
      middleStyle.WebkitTextStroke = `${weight}px ${colorString(lastStroke.color)}`;
    }

    const fontStyle = node.style;
    applyFontStyle(middleStyle, fontStyle);

    middleStyle.display = 'flex';
    middleStyle.maxWidth = '-webkit-fill-available';
    middleStyle.alignContent = 'flex-start';

    if (fontStyle.textAlignHorizontal === 'CENTER') {
      middleStyle.justifyContent = 'center';
    } else if (fontStyle.textAlignHorizontal === 'LEFT') {
      middleStyle.justifyContent = 'flex-start';
    } else if (fontStyle.textAlignHorizontal === 'RIGHT') {
      middleStyle.justifyContent = 'flex-end';
    }

    if (fontStyle.textAlignVertical === 'CENTER') {
      middleStyle.verticalAlign = 'middle';
      middleStyle.alignItems = 'center';
      middleStyle.alignContent = 'center';
    } else if (fontStyle.textAlignVertical === 'TOP') {
      middleStyle.verticalAlign = 'top';
      middleStyle.alignItems = 'flex-start';
      middleStyle.alignContent = 'flex-start';
    } else if (fontStyle.textAlignVertical === 'BOTTOM') {
      middleStyle.verticalAlign = 'bottom';
      middleStyle.alignItems = 'flex-end';
      middleStyle.alignContent = 'flex-end';
    }

    if (Object.keys(props).includes('input')) {
      const inputId = printStyle({
        flex: 1,
        height: '100%'
      });
      content.push(
        `<input key="${node.id}" className="${inputId}" type="${props.input || 'text'}" placeholder="${
          node.characters
        }" name="${node.name.substring(7)}" />`
      );
    } else {
      let para = '';
      const styleCache = {};
      let currStyle = 0;
      let currStyleIndex = 0;

      const maxCurrStyle = Object.keys(node.styleOverrideTable)
        .map(s => Number.parseInt(s, 10))
        .reduce((key, max) => (key > max ? key : max), 0);

      const commitParagraph = key => {
        if (para !== '') {
          if (styleCache[currStyle] == null) {
            styleCache[currStyle] = {};
          }

          if (node.styleOverrideTable[currStyle] && node.styleOverrideTable[currStyle].fills) {
            const lastFill = getPaint(node.styleOverrideTable[currStyle].fills);
            if (lastFill) {
              if (lastFill.type === 'SOLID') {
                styleCache[currStyle].color = colorString(lastFill.color);
                middleStyle.opacity = lastFill.opacity;
              }
            }
          }

          applyFontStyle(styleCache[currStyle], node.styleOverrideTable[currStyle]);

          if (
            (Object.keys(props).includes('ellipsis') && props.ellipsis == null) ||
            (props.ellipsis &&
              props.ellipsis
                .split(',')
                .map(s => Number.parseInt(s, 10))
                .includes(currStyleIndex))
          ) {
            styleCache[currStyle].overflow = 'hidden';
            styleCache[currStyle].textOverflow = 'ellipsis';
          }

          if (Object.keys(props).includes('ellipsisFlex') && maxCurrStyle === currStyle) {
            styleCache[currStyle].flex = 1;
          }

          const id = printStyle(styleCache[currStyle]);

          if (id) content.push(`<span className="${id}" key="${key}">${para}</span>`);
          else content.push(`<span key="${key}">${para}</span>`);

          para = '';
          currStyleIndex++;
        }
      };

      for (const i in node.characters) {
        let idx = node.characterStyleOverrides && node.characterStyleOverrides[i];

        if (node.characters[i] === '\n') {
          commitParagraph(i);

          const id = printStyle({
            flex: 1,
            content: '""',
            minWidth: '-webkit-fill-available'
          });

          content.push(`<br className="${id}" key="${`br${i}`}" />`);
          middleStyle.flexWrap = 'wrap';
          continue;
        }

        if (idx == null) idx = 0;
        if (idx !== currStyle) {
          commitParagraph(i);
          currStyle = idx;
        }

        para += node.characters[i];
      }
      commitParagraph('end');
    }
  }
}
