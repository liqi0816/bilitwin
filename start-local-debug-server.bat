echo see ./docs/CONTRIBUTING.md for usage
.\node_modules\.bin\tsc
.\node_modules\.bin\rollup tsout/test-portal.js --file tsout/test-bundle.js --format iife
.\node_modules\.bin\http-server --cors -p 8081 -c-1
