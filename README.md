# React - Figma

#### This is a tool to help you export Figma project into React mockups

### Installation

`npm i -g figma-react`

### CLI Usage

`figma-react <file-key> [figma-dev-token] <preset-name>`

or you can provide .env file with the content

```
FIGMA_FILE_KEY=...
FIGMA_DEV_TOKEN=...
FIGMA_PRESET=...
```

### API Usage

```
const figmaReact = require('./figma');

figmaReact.runFigmaReact(options).catch(err => {
	console.error(err);
	console.error(err.stack);
	process.exit(1);
});
```

### Requirements

- Style JSX

### Features

- Customizable Style Plugins
- Customizable Content Plugins
- CLI tool
- Can read .env properties

# Options

- fileKey // * required
- devToken // * required
- dir // default './src/design-system'
- makeDir // default !!process.env.FIGMA_MAKE_DIR
- stylePlugins // default from './figma.style.plugins'
- contentPlugins // default from './figma.content.plugins'
- classPrefix // default 'figma-'
- delIndex // default '??'
- paramsSplitIndex // default '&'
- paramSplitIndex // default '='
- objectIndex // default '.'
- styleDescriptionDelimiter // default '!style!'
- imports // default ['import { observer } from 'mobx-react';']
- decorator // default 'observer'
- typeFactory // default ({ props: componentProps }) => `string`
- prettierOptions // default
```
{
  "parser": "babel",
  "semi": true,
  "tabWidth": 2,
  "printWidth": 140,
  "singleQuote": true,
  "trailingComma": "none"
}
```


### Development
`npm link`