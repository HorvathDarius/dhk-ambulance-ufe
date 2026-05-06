import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'ambulance-ufe',
  globalScript: 'src/global/app.ts',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  testing: {
    browserHeadless: "shell",
    moduleNameMapper: {
      '^@material/web/.*$': '<rootDir>/src/test-mocks/material-web-empty.js',
    },
  },
};