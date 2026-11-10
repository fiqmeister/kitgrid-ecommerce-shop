// client cannot and must not import from backend
// so this page and the server's cart always round the same way
function roundMoney(amount) {
    return Math.round(amount * 100) / 100;
}

export default roundMoney;