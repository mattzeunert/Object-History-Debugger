npm link
npm run predeploy
cd src/babel-plugin-dist-test
npm install
npm link object-history-debugger
./node_modules/.bin/webpack
./node_modules/.bin/karma start --single-run
cd ../../
npm run undo-predeploy
