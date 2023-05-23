const { Client } = require('tplink-smarthome-api');
const BulbWrapper = require('./bulb-gradient');
const Gpio = require('onoff').Gpio;

const client = new Client();
const discoIntervalTime = 8000;
let discoIntervalId = null;

/** 
 * Problems:
 *  * CTRL-C doesn't quit and doesn't error properly
 *  * Debounce support?
 */

// Setup GPIO
const blackButton = new Gpio(17, 'in', 'both');
const led = new Gpio(2, 'out');
const redButton = new Gpio(4, 'in', 'both');
const whiteButton = new Gpio(27, 'in', 'both');
const yellowButton = new Gpio(5, 'in', 'both');
const greenButton = new Gpio(26, 'in', 'both');

led.writeSync(0); // Led off at start

//Free Resources on kill
process.on('SIGINT', _ => {
  redButton.unexport();
  whiteButton.unexport();
  yellowButton.unexport();
  greenButton.unexport();
  blackButton.unexport();
  led.unexport();
  // Kill process
});

(async () => {

  // Smart Bulb
  const smartBulbDevice = await client.getDevice({ host: '192.168.1.104' });
  const isOn = await smartBulbDevice.getPowerState();

  

  /** Initialisers */
  // Turn bulb on, if off
  if (!isOn) {
    await smartBulbDevice.togglePowerState();
  }

  // Create our custom bulb wrapper object
  const bulbDisco = new BulbWrapper(smartBulbDevice);

  // Start the disco with an interval of 8 seconds between gradients
  discoIntervalId = bulbDisco.startDisco(discoIntervalTime);

  /** Buttons */
  // Black Button => toggle led
  blackButton.watch((err, value) => {
    if (err) {
      throw err;
    }
    
    buttonPress("black", value);

  });
  // Red Button => On/Off toggle for smart bulb
  redButton.watch(async (err, value) => {
    if (err) {
      throw err;
    }

    buttonPress("red", value);

    if (value^1) {
      console.log("Toggle power");
      await smartBulbDevice.togglePowerState()
    }
  });
  // White Button => White rgb(255,255,255)
  whiteButton.watch(async (err, value) => {
    if (err) {
      throw err;
    }

    buttonPress("white", value);

    if (value^1) {
      console.log("Start white");
      await smartBulbDevice.lighting.setLightState({
        transition_period: 0,
        hue: 0,
        saturation: 0,
        brightness: 100,
        color_temp: 0
      });
    }
  });
  // Yellow Button => Orange rgb(255,100,42)
  yellowButton.watch(async (err, value) => {
    if (err) {
      throw err;
    }

    buttonPress("yellow", value);
    
    if (value^1) {
      console.log("Start orange");
      await smartBulbDevice.lighting.setLightState({
        transition_period: 0,
        hue: 16,
        saturation: 100,
        brightness: 58.2,
        color_temp: 0
      })
    }
  });
  // Green Button => Disco/Gradient Mode
  greenButton.watch((err, value) => {
    if (err) {
      throw err;
    }

    buttonPress("green", value);

    if (value^1) {
      console.log("Start disco");
      discoIntervalId = bulbDisco.startDisco(discoIntervalTime);
    }
  });
})()

// Show light on press and clear disco on down
function buttonPress(colour, value) {
  console.log(colour, "button pressed:", value);
  led.writeSync(value^1)

  // Stop disco
  if (value^1) {
    console.log("Stop disco");
    clearInterval(discoIntervalId);
  }
}


