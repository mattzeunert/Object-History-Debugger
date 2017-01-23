mkdir chrome-extension-dist
cp babel-plugin.js chrome-extension-dist/babel-plugin.js
cp ChromeCodeInstrumenter.js chrome-extension-dist/ChromeCodeInstrumenter.js
cp background.html chrome-extension-dist/background.html
cp background.js chrome-extension-dist/background.js
cp ohd.js chrome-extension-dist/ohd.js
cp manifest.json chrome-extension-dist/manifest.json
cp icon.png chrome-extension-dist/icon.png
zip -r ohd-extension.zip ./chrome-extension-dist/
rm -r chrome-extension-dist
