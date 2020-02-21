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

### Example with MobX & Gatsby

Run in your terminal the following code, but replace `<figma-dev-token>` with your Figma Dev Token (You can generate it on your profile settings page)
```
npm i -g gatsby-cli figma-react
gatsby new figma-demo https://github.com/makamekm/gatsby-starter-typescript-ioc-mobx
cd figma-demo
figma-react InZsgUaqMorH2q5iapfUDK <figma-dev-token> mobx
npm run dev
```

Then just put into pages/index.tsx the following code and import dependencies:
```
  <div style={{ height: '300px' }}>
    <ChromeMockup />
  </div>
  <Helmet>
    <link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet" />
  </Helmet>
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
- classAfterFix // default 'Generated'
- fileAfterFix // default '.generated'
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

This repository uses Git Flow

