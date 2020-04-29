const {
  colorString,
  emptyChildren,
  getComponentName,
  createComponent,
  getDescriptionStyles,
  saveSvgToDisk,
  getPaint,
  applyFontStyle,
  dropShadow,
  innerShadow,
  clearObject
} = require('./lib');
const svgtojsx = require('./svg-to-jsx');

const contentPlugins = [
  applyStyles,
  setComponentFromCache,
  renderMask,
  renderVector,
  renderPropsChildren,
  renderPropsChildrenIfEmpty,
  renderIfTrue,
  renderIfFalse,
  setOnClick,
  setId,
  addClassName,
  setTextRenderer
];

function applyStyles(state) {
  const { middleStyle, innerStyle, outerStyle, props } = state;
  Object.assign(middleStyle, props.style);
  Object.assign(innerStyle, props.innerStyle);
  Object.assign(outerStyle, props.outerStyle);
}

// TODO: use import from './${getComponentName(node.name, options)}'
async function setComponentFromCache(state, shared) {
  const { node, content, classNames } = state;
  const { component, componentMap, localComponentMap, options, additionalStyles, genClassName } = shared;
  if (node.id !== component.id && node.name.charAt(0) === '#') {
    const name = getComponentName(node.name, options);
    emptyChildren(state);
    content.push(`<${name} {...props} nodeId='${node.id}' />`);
    if (!componentMap[name]) await createComponent(node, shared);
    localComponentMap[name] = componentMap[name];

    const currentClass = genClassName();
    classNames.push(currentClass);
    additionalStyles.push(`
      .${currentClass} > :global(*) {
        height: 100%;
        width: 100%;
      }
    `);
  } else if (node.id !== component.id) {
    const styles = getDescriptionStyles(shared, node);
    if (styles) {
      additionalStyles.push(styles);
    }
  }
}

function renderMask(state) {
  const { node } = state;
  if (node.isMask) {
    emptyChildren(state);
  }
}

async function renderVector(state, shared) {
  const { vectors, genClassName, additionalStyles } = shared;
  const { node, props, content } = state;
  if (node.type === 'VECTOR' && vectors[node.id] && !node.isMask) {
    emptyChildren(state);

    const currentClass = genClassName();

    const cHorizontal = node.constraints && node.constraints.horizontal;
    const cVertical = node.constraints && node.constraints.vertical;

    const scaleHorizontal = cHorizontal === 'LEFT_RIGHT' || cHorizontal === 'SCALE';
    const scaleVertical = cVertical === 'TOP_BOTTOM' || cVertical === 'SCALE';

    let additionalSvgStyles = '';
    if (scaleHorizontal) additionalSvgStyles += `left: 0;\nwidth: 100%;\n`;
    if (scaleVertical) additionalSvgStyles += `top: 0;\nheight: 100%;\n`;
    if (scaleHorizontal && scaleVertical) {
      additionalSvgStyles += `transform: unset;\n`;
    } else if (scaleHorizontal && !scaleVertical) {
      additionalSvgStyles += `transform: translateY(-50%);\n`;
    } else if (!scaleHorizontal && scaleVertical) {
      additionalSvgStyles += `transform: translateX(-50%);\n`;
    }

    if (additionalSvgStyles.length > 0) {
      additionalSvgStyles = `\n.${currentClass} {\n` + additionalSvgStyles;
      additionalSvgStyles += `}\n`;
      additionalStyles.push(additionalSvgStyles);
    }

    if (Object.keys(props).includes('vectorImg')) {
      const fileName = node.id.replace(/\W+/g, '-');
      const url = await saveSvgToDisk(fileName, vectors[node.id], shared);
      content.push(`<img className='vector ${currentClass}' src='${url}' />`);
    } else {
      let svg = await svgtojsx(vectors[node.id]);
      svg = svg.replace('<svg', `<svg className='vector ${currentClass}'`);
      content.push(svg);
    }
  }
}

function renderPropsChildren(state, { props: componentProps }) {
  const { content, props } = state;
  if (Object.keys(props).includes('content') && !Object.keys(props).includes('contentIfEmpty')) {
    emptyChildren(state);
    content.push(`{${props.content}}`);
    componentProps[props.content] = 'any';
  }
}

function renderPropsChildrenIfEmpty(state, { props: componentProps, print }) {
  const { content, props } = state;
  if (Object.keys(props).includes('content') && Object.keys(props).includes('contentIfEmpty')) {
    print(`{ !${props.content} && (`);
    content.push(`)}`);
    content.push(`{${props.content}}`);
    componentProps[props.content] = 'any';
  }
}

function renderIfTrue(state, { props: componentProps, print }) {
  const { content, props } = state;
  if (Object.keys(props).includes('ifTrue')) {
    print(`{ !!${props.ifTrue} && (`);
    content.push(`)}`);
    componentProps[props.ifTrue] = 'any';
  }
}

function renderIfFalse(state, { props: componentProps, print }) {
  const { content, props } = state;
  if (Object.keys(props).includes('ifFalse')) {
    print(`{ !!${props.ifFalse} && (`);
    content.push(`)}`);
    componentProps[props.ifFalse] = 'any';
  }
}

function setOnClick(state, { props: componentProps }) {
  const { props, nodeProps } = state;
  if (Object.keys(props).includes('onClick')) {
    nodeProps['onClick'] = props.onClick;
    componentProps[props.onClick] = 'React.MouseEventHandler<HTMLElement>';
  }
}

function setId(state) {
  const { props, nodeProps } = state;
  if (Object.keys(props).includes('id')) {
    nodeProps['id'] = `'${props.id}'`;
  }
}

function addClassName(state) {
  const { props, classNames } = state;
  if (Object.keys(props).includes('class')) {
    classNames.push(props.class);
  }
}

function setTextRenderer({ node, props, middleStyle, content, nodeProps, classNames }, { printStyle }) {
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
      const inputId = printStyle({
        flex: 1,
        height: '100%'
      });
      content.push(`<input`);
      if (!Object.keys(nodeProps).includes('id')) content.push(`id='${node.id}'`);
      Object.keys(nodeProps).forEach(key => {
        content.push(`${key}={${nodeProps[key]}}`);
      });
      content.push(`className='${inputId}${classNames.length ? ' ' : ''}${classNames.join(' ')}'`);
      content.push(
        `
        type="${props.input || 'text'}"
        placeholder="${node.characters}" />`
      );

      clearObject(nodeProps);
    } else {
      let para = '';
      const styleCache = {};
      let currStyle = 0;
      let currStyleIndex = 0;

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

        if (id) content.push(`<span className="${id}" key="${key}">${spaceBefore}{\`${para}\`}${spaceAfter}</span>`);
        else content.push(`<span key="${key}">${spaceBefore}{\`${para}\`}${spaceAfter}</span>`);

        para = '';
        currStyleIndex++;
      };

      for (const i in node.characters) {
        let idx = node.characterStyleOverrides && node.characterStyleOverrides[i];
        const char = node.characters[i];

        if (node.characters[i] === '\n' && node.characters[i - 1] === '\n') {
          const id = printStyle({
            flex: 1,
            minWidth: '-webkit-fill-available'
          });
          content.push(`<div className="${id}" key="${`br${i}`}">&nbsp;</div>`);
        } else if (node.characters[i] === '\n') {
          commitParagraph(i);

          const id = printStyle({
            flex: 1,
            content: '""',
            minWidth: '-webkit-fill-available'
          });
          content.push(`<br className="${id}" key="${`br${i}`}" />`);
          middleStyle.flexWrap = 'wrap';
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

module.exports = {
  applyStyles,
  contentPlugins,
  setComponentFromCache,
  renderVector,
  renderPropsChildren,
  renderPropsChildrenIfEmpty,
  renderIfTrue,
  renderIfFalse,
  setOnClick,
  setId,
  addClassName,
  setTextRenderer
};
