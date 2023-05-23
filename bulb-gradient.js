// BulbWrapper wraps around the bulb from 'tplink-smarthome-api'
class BulbWrapper {
  constructor(bulb) {
    this.bulb = bulb
    this.hue = 0
    this.saturation = 0
    this.colorTemp = 0
    this.brightness = 0
    this.discoIntervalId = null
  }

  setColor(changeInterval) {

    const lightSettings = {
      transition_period: changeInterval,
      //mode: ,
      hue: Math.floor(Math.random() * 360), //0-360
      saturation: 100, //Math.floor(Math.random() * 100), //0-100
      brightness: 100, //0-100
      color_temp: 0 //0-5000
    }

    return this.bulb.lighting.setLightState(lightSettings)
  }

  startDisco(changeInterval = 1000) {

    this.discoIntervalId = setInterval(async () => {

      await this.setColor(3000)

    }, changeInterval);

    return this.discoIntervalId;
  }
}

module.exports = BulbWrapper
