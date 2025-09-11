// Import APIs
const { register, login } = require("./auth");
const { addHealCoins } = require("./healcoin_engine");

// Export as Firebase Functions
exports.register = register;
exports.login = login;
exports.addHealCoins = addHealCoins;