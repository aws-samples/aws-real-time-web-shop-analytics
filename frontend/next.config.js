/* eslint-disable @typescript-eslint/no-var-requires */
const withTM = require('next-transpile-modules')([
  '@cloudscape-design/component-toolkit',
  '@cloudscape-design/components'
]);


/** @type {import('next').NextConfig} */
module.exports = withTM({
  reactStrictMode: true
});