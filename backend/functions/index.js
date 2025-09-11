// Import APIs
const { register, login } = require("./auth");
const { addHealCoins } = require("./healcoin_engine");
const { getWalletBalance, getWalletHistory } = require("./wallet_service");
const { runSimulation } = require("./simulation");
const { submitQuiz, submitWaste } = require("./game_logic");

// Export as Firebase Functions
exports.register = register;
exports.login = login;
exports.addHealCoins = addHealCoins;
exports.getWalletBalance = getWalletBalance;
exports.getWalletHistory = getWalletHistory;
exports.runSimulation = runSimulation;
exports.submitQuiz = submitQuiz;
exports.submitWaste = submitWaste;