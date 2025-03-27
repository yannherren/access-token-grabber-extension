<img src="readme/icon.png" height="120">


# Access Token Grabber Chrome extension 

![chrome](https://img.shields.io/static/v1?label=Chrome%20extension&message=Access%20Token%20Grabber&logo=googlechrome&color=green&style=for-the-badge)

Introducing the quickest and easiest way to retrieve your web request access token. Say goodbye to the hassle of digging through dev tools! This open-source extension streamlines the process, letting you grab your access token effortlessly and transparently.

![asset2_atg](readme/1.png)
![asset1_atg](readme/2.png)

# Project setup

## Development
Install the dependencies using
```
npm install
```

Run dev build with hot reload 
```
npm run watch
```

Go to `chrome://extensions/` in Chrome / Chromium. Enable **Developer Mode** on the top right. Click on **Load unpacked** and select the project's **dist** folder. 

## Production

Create a production build
```
npm run build
```