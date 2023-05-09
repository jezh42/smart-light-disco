Disco Mode For (Kasa KL130) Smart Light(s)
===

![origin disco mode gif](disco_720.gif)

## Fork Changes

* Origin: [smart-light-disco](https://github.com/jrudio/smart-light-disco)
  * GIF above is from origin. Doesn't display this forks functionality
* Bulb Colour Changes:
  * Added support for full-saturation random colours
  * Changed colours to make it more of a gradient
  * Simplified code
* GPIO Support (see below)

## Explanation

### Bulbs supported

* Kasa KL130

### GPIO Support

* Added support for remote control through GPIO buttons.
  * Buttons for:
    * On/Off toggle
    * White
    * Disco
    * Orange
* Tested on a **Raspberry PI 3 Model B**
* TODO: Add a diagram of tested button setup
* TODO: Add explanation of how to customise for different button setup

## How to use

1. `npm install smart-light-disco`

2. Change host to the IP of the smart bulb in index.js
   1. `const device = await client.getDevice({ host: '192.168.X.X' })`
