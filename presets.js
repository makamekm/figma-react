const { contentPlugins } = require('./content.plugins');
const { stylePlugins } = require('./style.plugins');
const { typeFactoryDefault } = require('./lib');

module.exports = {
  default: {
    dir: './src/design-system',
    makeDir: true,
    stylePlugins: stylePlugins,
    contentPlugins: contentPlugins,
    classPrefix: 'figma-',
    delIndex: '??',
    paramsSplitIndex: '&',
    paramSplitIndex: '=',
    objectIndex: '.',
    styleDescriptionDelimiter: '!style!',
    imports: [],
    decorator: 'React.memo',
    typeFactory: typeFactoryDefault,
    classAfterFix: 'Generated',
    fileAfterFix: '.generated',
    prettierOptions: {
      parser: 'typescript',
      semi: true,
      tabWidth: 2,
      printWidth: 140,
      singleQuote: true,
      trailingComma: 'none'
    },
    imageFormat: 'png',
    imageDir: './static/images',
    imageUrlPrefix: '/images/',
    imageScale: 2
  },
  mobx: {
    dir: './src/design-system',
    makeDir: true,
    stylePlugins: stylePlugins,
    contentPlugins: contentPlugins,
    classPrefix: 'figma-',
    delIndex: '??',
    paramsSplitIndex: '&',
    paramSplitIndex: '=',
    objectIndex: '.',
    styleDescriptionDelimiter: '!style!',
    imports: [`import { observer } from 'mobx-react';`],
    decorator: 'observer',
    typeFactory: typeFactoryDefault,
    classAfterFix: 'Generated',
    fileAfterFix: '.generated',
    prettierOptions: {
      parser: 'typescript',
      semi: true,
      tabWidth: 2,
      printWidth: 140,
      singleQuote: true,
      trailingComma: 'none'
    },
    imageFormat: 'png',
    imageDir: './static/images',
    imageUrlPrefix: '/images/',
    imageScale: 2
  }
};
