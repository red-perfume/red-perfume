const validator = require('./src/validator.js');
const atomize = require('./src/process-tasks.js');

const redPerfume = {
  validate: function (options) {
    return validator.validateOptions(options);
  },
  atomize: function (options) {
    options = this.validate(options);
    atomize.processTasks(options);
  }
};

module.exports = redPerfume;
