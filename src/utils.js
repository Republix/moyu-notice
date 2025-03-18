const path = require('path');

class Utils {

  static loadConfig () {
    const configPath = path.resolve(process.cwd(), './config');

    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  }

}

module.exports = Utils;