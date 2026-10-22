const jwt = require ('jsonwebtoken');
const crypto = require ('crypto');
// function to create jwt access token
function signAccessToken(user) {
    return jwt.sign({
        id: user.id,
        role: user.role
    }, 
    process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    });
}
// function to create jwt refresh token
function signRefreshToken(user) {
    return jwt.sign({
        id: user.id
    }, 
    process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    });
}
// db only stores the hash
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
// reads the expiry time that is inside the token
function getExpiry(token) {
    return new Date(jwt.decode(token).exp * 1000);
}

module.exports = { signAccessToken, signRefreshToken, hashToken, getExpiry };