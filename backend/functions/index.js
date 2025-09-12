// Import APIs
const { register, login } = require("./auth");
const { addHealCoins } = require("./healcoin_engine");
const { getWalletBalance, getWalletHistory } = require("./wallet_service");
const { logMood, logKindness } = require("./user_actions");
const { runSimulation } = require("./simulation");
const { submitQuiz, submitWaste } = require("./game_logic");
const { createMSMEProfile, logEnergy, logWaste } = require("./msme_logs");
const { generateMSMEReportPDF, getAdminDashboardData } = require("./report_generator");

// Export as Firebase Functions
exports.register = register;
exports.login = login;
exports.addHealCoins = addHealCoins;
exports.getWalletBalance = getWalletBalance;
exports.getWalletHistory = getWalletHistory;
exports.logMood = logMood;
exports.logKindness = logKindness;
exports.runSimulation = runSimulation;
exports.submitQuiz = submitQuiz;
exports.submitWaste = submitWaste;
exports.createMSMEProfile = createMSMEProfile;
exports.logEnergy = logEnergy;
exports.logWaste = logWaste;
exports.generateMSMEReportPDF = generateMSMEReportPDF;
exports.getAdminDashboardData = getAdminDashboardData;