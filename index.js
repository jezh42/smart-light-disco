const { Client } = require('tplink-smarthome-api');
const BulbWrapper = require('./bulb-gradient');
const Gpio = require('onoff').Gpio;

const client = new Client();
const discoInterval = 8000;

/** 
 * Problems:
 *  * Disco stays on
 *  * CTRL-C doesn't quit and doesn't error properly
 *  * Debounce support?
 */

// Setup GPIO
const redButton = new Gpio(4, 'in', 'both');
const whiteButton = new Gpio(27, 'in', 'both');
const yellowButton = new Gpio(19, 'in', 'both');
const greenButton = new Gpio(26, 'in', 'both');
const blackButton = new Gpio(17, 'in', 'both');
const led = new Gpio(2, 'out');
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
  bulbDisco.startDisco(discoInterval);

  /** Buttons */
  // Black Button => toggle led
  blackButton.watch((err, value) => {
    if (err) {
      throw err;
    }
    
    buttonTest("black", value);

  });
  // Red Button => On/Off toggle for smart bulb
  redButton.watch(async (err, value) => {
    if (err) {
      throw err;
    }

    buttonTest("red", value);

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

    buttonTest("white", value);

    if (value^1) {
      console.log("Toggle white");
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

    buttonTest("yellow", value);
    
    if (value^1) {
      console.log("Toggle orange");
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

    buttonTest("green", value);

    if (value^1) {
      console.log("Toggle orange");
      bulbDisco.startDisco(discoInterval)
    }
  });
})()

// Test the button
function buttonTest(colour, value) {
  console.log(colour, "button pressed:", value);
  led.writeSync(value^1)
}


