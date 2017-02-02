mkdir chrome-extension-dist
cp src/babel-plugin.js chrome-extension-dist/babel-plugin.js
cp src/ChromeCodeInstrumenter.js chrome-extension-dist/ChromeCodeInstrumenter.js
cp src/background.html chrome-extension-dist/background.html
cp src/background.js chrome-extension-dist/background.js
cp src/ohd.js chrome-extension-dist/ohd.js
cp src/manifest.json chrome-extension-dist/manifest.json
cp src/icon.png chrome-extension-dist/icon.png
zip -r ohd-extension.zip ./chrome-extension-dist/
rm -r chrome-extension-dist
