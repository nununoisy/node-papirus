# node-papirus
A Node.js library for interacting with the [PaPiRus](https://www.pi-supply.com/product/papirus-epaper-eink-screen-hat-for-raspberry-pi/) via the [repaper gratis library](https://github.com/repaper/gratis).

## How it works
node-papirus is an asynchronous, chainable library built to quickly build the contents of the screen. It supports the PaPiRus and it's Zero variant, and every screen size.

This library is still WIP, so some methods are usable but buried. It is written in ES6, but can be transpiled with Babel.

## Building/installing
1. Clone this repo into your `node_modules` directory:
```bash
cd /path/to/node_modules
git clone https://github.com/nununoisy/node-papirus
cd node-papirus
```
2. Install dependencies and build the module:
```bash
npm install
npm build
```
3. Return to your project directory. node-papirus is now installed!

## Example usage
### Hello World on a Pi Zero using the large screen
```js
const Papirus = require('node-papirus');
const screen = new Papirus(200, 96, true);

screen.reset();

screen.clear().addText("Hello, world!", Papirus.FONT_SANS_32_BLACK, 0, 0).write();
```

Code is documented using the JSDoc 3 spec.
