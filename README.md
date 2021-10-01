# Development

1. Start Forbole X web app in port 3000
2. Copy `.env` file to a new file `.env.local` and change `REACT_APP_WEB_APP_BASE_URL` value to `http://localhost:3000`
3. Run `yarn build` to build the app and generate `build` folder
4. Go to [chrome://extensions](chrome://extensions) and enable Developer mode
5. Click "Load Unpacked" and select the `build` folder
6. The extension will then be added to chrome. Pin the extension to chrome toolbar and click on it to see the UI
7. Run `yarn start` to start the app on web and it will trigger the extension to show a popup
