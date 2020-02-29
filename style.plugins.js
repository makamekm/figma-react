const requestImageSize = require('request-image-size');
const {
  colorString,
  dropShadow,
  innerShadow,
  getPaint,
  paintToLinearGradient,
  paintToRadialGradient,
  applyFontStyle,
  loadImageFromImagesToDisk,
  loadImageFromRefImagesToDisk
} = require('./lib');

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
  if (bounds && bounds.width && cHorizontal !== 'LEFT_RIGHT' && cHorizontal !== 'SCALE') {
    middleStyle.width = bounds.width;
  }
  if (cHorizontal === 'LEFT_RIGHT') {
    if (bounds != null) {
      outerStyle.position = 'relative';
      outerStyle.display = 'flex';
      outerStyle.pointerEvents = 'none';
      outerStyle.justifyContent = 'stretch';
      if (bounds != null) {
        middleStyle.width = bounds.width;
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
      middleStyle.minWidth = middleStyle.width;
      if (node.clipsContent) {
        middleStyle.maxWidth = middleStyle.width;
      }
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
      if (node.clipsContent) {
        middleStyle.minWidth = middleStyle.width;
        middleStyle.maxWidth = middleStyle.width;
      }
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
      middleStyle.marginRight = `${(bounds.right * 100) / parentWidth}%`;
      if (node.clipsContent) {
        middleStyle.minWidth = middleStyle.width;
        middleStyle.maxWidth = middleStyle.width;
      }
    }
  } else if (cHorizontal === 'LEFT') {
    if (bounds != null) {
      outerStyle.position = 'relative';
      outerStyle.display = 'flex';
      middleStyle.marginLeft = bounds.left;
      middleStyle.minWidth = middleStyle.width;
      if (node.clipsContent) {
        middleStyle.maxWidth = middleStyle.width;
      }
      middleStyle.width = null;
    }
  }
}

function setVerticalAlign({ node, middleStyle, outerStyle, bounds }) {
  const cVertical = node.constraints && node.constraints.vertical;
  middleStyle.debugV = cVertical;
  if (bounds && bounds.height && cVertical !== 'TOP_BOTTOM' && cVertical !== 'SCALE') {
    middleStyle.height = bounds.height;
  }
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
      if (node.clipsContent) {
        middleStyle.minHeight = middleStyle.height;
        middleStyle.maxHeight = bounds.width;
      }
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
      middleStyle.bottom = `${(bounds.bottom * 100) / parentHeight}%`;
      if (node.clipsContent) {
        middleStyle.minHeight = middleStyle.height;
        middleStyle.maxHeight = middleStyle.height;
      }
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
      middleStyle.minHeight = middleStyle.height;
      if (node.clipsContent) {
        middleStyle.maxHeight = middleStyle.height;
      }
    }
  } else if (cVertical === 'TOP') {
    if (bounds != null) {
      outerStyle.position = 'relative';
      outerStyle.display = 'flex';
      middleStyle.position = 'relative';
      middleStyle.marginTop = bounds.top;
      middleStyle.marginBottom = bounds.bottom;
      middleStyle.minHeight = middleStyle.height;
      if (node.clipsContent) {
        middleStyle.maxHeight = middleStyle.height;
      }
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

async function setFrameStyles(state, shared) {
  const { refImages, images, genClassName, additionalStyles } = shared;
  const { node, parent, middleStyle, props, bounds, classNames } = state;

  const addBackground = (value, size) => {
    middleStyle.background = `${middleStyle.background ? `${middleStyle.background}, ` : ''}${value}`;
    middleStyle.backgroundSize = `${middleStyle.backgroundSize ? `${middleStyle.backgroundSize}, ` : ''}${size || 'auto'}`;
  };

  if (['FRAME', 'RECTANGLE', 'INSTANCE', 'COMPONENT'].includes(node.type)) {
    const fills = node.fills.reduce((arr, fill) => {
      if (fill.visible !== false) {
        arr.unshift(fill);
      }
      return arr;
    }, []);

    if (node.clipsContent) {
      middleStyle.overflow = 'hidden';
    }

    if (node.backgroundColor) {
      const color = colorString(node.backgroundColor);
      addBackground(`linear-gradient(to bottom, ${color} 0%, ${color} 100%)`);
    }

    if (images[node.id] != null && !Object.keys(props).includes('generateBG')) {
      const url = `url(${await loadImageFromImagesToDisk(node, shared)})`;

      if (bounds && Math.abs(bounds.angle) > 0) {
        const left = (parent.absoluteBoundingBox.width - bounds.width) / 2 / bounds.width;
        const top = (parent.absoluteBoundingBox.height - bounds.height) / 2 / bounds.height;

        const afterId = genClassName();
        classNames.push(afterId);
        additionalStyles.push(`
          .${afterId}::after {
            position: absolute;
            pointer-events: none;
            left: -${left * 100}%;
            right: -${left * 100}%;
            top: -${top * 100}%;
            bottom: -${top * 100}%;
            content: '';
            background: ${url} center center no-repeat;
            background-size: contain;
            transform: rotate(${bounds.angle}deg);
            transform-origin: 50% 50%;
          }
        `);
      } else {
        addBackground(`${url} center center no-repeat`, 'cover');
      }
    } else {
      for (let fill of fills) {
        if (fill.type === 'SOLID') {
          const color = colorString(fill.color, fill.opacity);
          addBackground(`linear-gradient(to bottom, ${color} 0%, ${color} 100%)`);
        }

        if (fill.type === 'IMAGE' && refImages[fill.imageRef] != null) {
          const url = `url(${await loadImageFromRefImagesToDisk(fill.imageRef, shared)})`;
          const imageSize = await requestImageSize(refImages[fill.imageRef]);

          if (fill.scaleMode === 'FILL') {
            addBackground(`${url} center center no-repeat`, 'cover');
          } else if (fill.scaleMode === 'FIT') {
            addBackground(`${url} center center no-repeat`, 'contain');
          } else if (fill.scaleMode === 'TILE') {
            addBackground(`${url} left top repeat`, `${fill.scalingFactor * imageSize.width}px ${fill.scalingFactor * imageSize.height}px`);
          } else if (fill.scaleMode === 'STRETCH') {
            addBackground(`${url} ${100 * fill.imageTransform[0][2]}% ${100 * fill.imageTransform[1][2]}% no-repeat`, 'cover');
          }
        }

        if (fill.type === 'GRADIENT_LINEAR') {
          addBackground(paintToLinearGradient(fill));
        }

        if (fill.type === 'GRADIENT_RADIAL') {
          addBackground(paintToRadialGradient(fill));
        }
      }
    }

    const addValue = (name, value) => {
      middleStyle[name] = `${middleStyle[name] ? `${middleStyle[name]}, ` : ''}${value}`;
    };

    if (node.effects) {
      for (let effect of node.effects) {
        if (effect.visible === false) {
          continue;
        }

        if (effect.type === 'DROP_SHADOW') {
          if (Object.keys(props).includes('filterShadow')) {
            addValue('filter', `drop-shadow(${dropShadow(effect)})`);
          } else {
            addValue('boxShadow', `${dropShadow(effect)}`);
          }
        }
        if (effect.type === 'INNER_SHADOW') {
          if (Object.keys(props).includes('filterShadow')) {
            addValue('filter', `drop-shadow(${innerShadow(effect)})`);
          } else {
            addValue('boxShadow', `${innerShadow(effect)}`);
          }
        }
        if (effect.type === 'LAYER_BLUR') {
          addValue('filter', `blur(${effect.radius}px)`);
        }
        if (effect.type === 'BACKGROUND_BLUR') {
          addValue('backdropFilter', `blur(${effect.radius}px)`);
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

    const makeItFlex = () => {
      middleStyle.display = 'flex';
      middleStyle.maxWidth = '-webkit-fill-available';
      middleStyle.alignContent = 'flex-start';
    };

    if (fontStyle.textAlignHorizontal === 'CENTER') {
      middleStyle.justifyContent = 'center';
      middleStyle.textAlign = 'center';
    } else if (fontStyle.textAlignHorizontal === 'LEFT') {
      middleStyle.justifyContent = 'flex-start';
      middleStyle.textAlign = 'left';
    } else if (fontStyle.textAlignHorizontal === 'RIGHT') {
      middleStyle.justifyContent = 'flex-end';
      middleStyle.textAlign = 'right';
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

    const addValue = (name, value) => {
      middleStyle[name] = `${middleStyle[name] ? `${middleStyle[name]}, ` : ''}${value}`;
    };

    if (node.effects) {
      for (let i = 0; i < node.effects.length; i++) {
        const effect = node.effects[i];

        if (effect.visible === false) {
          continue;
        }

        if (effect.type === 'DROP_SHADOW') {
          if (Object.keys(props).includes('filterShadow')) {
            addValue('filter', `drop-shadow(${dropShadow(effect)})`);
          } else {
            addValue('textShadow', dropShadow(effect));
          }
        }
        if (effect.type === 'INNER_SHADOW') {
          if (Object.keys(props).includes('filterShadow')) {
            addValue('filter', `drop-shadow(${innerShadow(effect)})`);
          } else {
            addValue('textShadow', innerShadow(effect));
          }
        }
      }
    }

    if (Object.keys(props).includes('input')) {
      makeItFlex();
      const inputId = printStyle({
        flex: 1,
        height: '100%'
      });
      content.push(
        `<input
        key="${node.id}"
        className="${inputId}"
        type="${props.input || 'text'}" placeholder="${node.characters}" name="${node.name.substring(7)}" />`
      );
    } else {
      let para = '';
      const styleCache = {};
      let currStyle = 0;
      let currStyleIndex = 0;
      let nextLineCounter = 0;
      let nextLineIndicator = false;

      const maxCurrStyle = Object.keys(node.styleOverrideTable)
        .map(s => Number.parseInt(s, 10))
        .reduce((key, max) => (key > max ? key : max), 0);

      const commitParagraph = key => {
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
          makeItFlex();
        }

        if (Object.keys(props).includes('ellipsisFlex') && maxCurrStyle === currStyle) {
          styleCache[currStyle].flex = 1;
        }

        if (Object.keys(props).includes('ellipsisWrap') && maxCurrStyle === currStyle) {
          middleStyle.flexWrap = 'wrap';
        }

        const id = printStyle(styleCache[currStyle]);

        para = para.replace(/\"/g, '\\"');
        const spaceBefore = Array(para.length - para.trimLeft().length)
          .fill('&nbsp;')
          .join('');
        const spaceAfter = Array(para.length - para.trimRight().length)
          .fill('&nbsp;')
          .join('');
        para = para.trim();

        const br = Array(nextLineCounter)
          .fill('<br/>')
          .join('');

        if (id) content.push(`<span className="${id}" key="${key}">${spaceBefore}{\`${para}\`}${spaceAfter}${br}</span>`);
        else content.push(`<span key="${key}">${spaceBefore}{\`${para}\`}${spaceAfter}${br}</span>`);

        para = '';
        currStyleIndex++;

        nextLineCounter = 0;
        nextLineIndicator = false;
      };

      for (const i in node.characters) {
        let idx = node.characterStyleOverrides && node.characterStyleOverrides[i];
        const char = node.characters[i];

        if (nextLineIndicator && node.characters[i] !== '\n') {
          commitParagraph(i);
          para += char;
        } else if (node.characters[i] === '\n') {
          nextLineIndicator = true;
          nextLineCounter++;
        } else {
          if (idx == null) {
            idx = 0;
          }

          if (idx !== currStyle) {
            commitParagraph(i);
            currStyle = idx;
          }

          para += char;
        }
      }
      commitParagraph('end');
    }
  }
}
