## Questions, bug reports, and feature requests

Report anything in [the issue tracker](https://github.com/mattzeunert/Object-History-Debugger/issues).

## Building OHD locally

```
npm install
npm run webpack
```

For tests use `npm run tests`.

For demo: `npm run predeploy;npm run demo`.
Then run a static file server in the docs/demo subfolder.

For the Chrome extension open the src folder as an unpacked extension in Chrome.

ChromeCodeInstrumenter, resolveFrameWorkerAsString, and CodePreprocessor are taken from [FromJS](https://github.com/mattzeunert/fromjs).

Publishing on NPM: `npm run predeploy; npm publish`