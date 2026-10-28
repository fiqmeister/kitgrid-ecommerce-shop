// rounds amount to 2 decimals
function roundMoney(amt) {
    return Math.round(amt * 100) / 100;
}

module.exports = roundMoney;