# Intro

This is a very simple PoC to show how to create chrome extensions in React, and how it can communicate with web app.

# Development

1. Run `yarn build` to build the app and generate `build` folder
2. Go to [chrome://extensions](chrome://extensions) and enable Developer mode
3. Click "Load Unpacked" and select the `build` folder
4. The extension will then be added to chrome. Pin the extension to chrome toolbar and click on it to see the UI
5. Run `yarn start` to start the app on web and it will trigger the extension to show a popup

# TODO

1. Rewire `create-react-app`'s webpack config to pack `background.js`
2. Configure hot reloading [https://mmazzarolo.medium.com/developing-a-browser-extension-with-create-react-app-b0dcd3b32b3f](https://mmazzarolo.medium.com/developing-a-browser-extension-with-create-react-app-b0dcd3b32b3f)
