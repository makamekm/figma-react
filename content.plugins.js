const { emptyChildren, getComponentName, createComponent, getDescriptionStyles } = require('./lib');

const contentPlugins = [
  applyStyles,
  setComponentFromCache,
  renderVector,
  renderPropsChildren,
  renderPropsChildrenIfEmpty,
  renderIfTrue,
  renderIfFalse,
  setOnClick,
  setId,
  addClassName
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
  const { component, imgMap, componentMap, componentDescriptionMap, localComponentMap, options, additionalStyles, genClassName } = shared;
  if (node.id !== component.id && node.name.charAt(0) === '#') {
    const name = getComponentName(node.name, options);
    emptyChildren(state);
    content.push(`<${name} {...props} nodeId='${node.id}' />`);
    if (!componentMap[name]) await createComponent(node, imgMap, componentMap, componentDescriptionMap, options);
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

function renderVector(state, { imgMap }) {
  const { node, content } = state;
  if (node.type === 'VECTOR') {
    emptyChildren(state);
    content.push(`<div className='vector' dangerouslySetInnerHTML={{__html: \`${imgMap[node.id]}\`}} />`);
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
  addClassName
};