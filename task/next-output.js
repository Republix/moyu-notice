const { generateMessage } = require('../src/services/message');

const msg = generateMessage(new Date());

console.log(msg);
