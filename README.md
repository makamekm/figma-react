# React - Figma

#### This is a tool to help you export Figma project into React mockups

### Installation

`npm i -g figma-react`

### CLI Usage

`figma-react <file-key> [figma-dev-token]`

or you can provide .env file with the content

```
FIGMA_FILE_KEY_DEFAULT=...
FIGMA_DEV_TOKEN=...
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


### Development
`npm link`