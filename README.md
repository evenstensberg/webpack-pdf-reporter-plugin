# webpack-pdf-reporter-plugin

A plugin that reports your webpack stats to a PDF. Includes bundle information about added, deleted and current modules/assets.


## Installation

```console
npm install --save-dev webpack-pdf-reporter-plugin
```
## Usage

```js
const pdfReporterPlugin = require('webpack-pdf-reporter-plugin');

module.exports = {
    plugins: [
        new pdfReporterPlugin()
    ]
}
```

Running webpack twice with this plugin will report diff between builds.

# Example

See generated PDF [here](./example.pdf).