// The business rules/logic lives here

const bcrypt = require('bcrypt');
const userDal = require('../dal/userDal');
const refreshTokenDal = require('../dal/refreshTokenDal');
const tokens = require('../utils/tokens');
const createError = require('../utils/createError');

// destructuring: unpacks the req.body object 
// registering a user
async function register({ name, email, password }) {
    // trim any whitespace and make all chars lowercase
    const cleanEmail = email.trim().toLowerCase();

    const existing = await userDal.findByEmail(cleanEmail);
    if (existing) {
        throw createError('Email is already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = await userDal.create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash
    });
    return userDal.findById(id);
}
// user login
async function login ({ email, password }) {
    const user = await userDal.findByEmail(email.trim().toLowerCase());
    if (!user) {
        throw createError('Invalid email or password', 401);
    }
    // check the password provided with the hash in DB
    const passwordCheck = await bcrypt.compare(password, user.password_hash);
    if (!passwordCheck) {
        throw createError('Invalid email or password', 401);
    }
    // creating the tokens
    const accessToken = tokens.signAccessToken(user);
    const refreshToken = tokens.signRefreshToken(user);
    // pass in the newly created refresh token info in the DB
    await refreshTokenDal.createRT({
        userId: user.id,
        tokenHash: tokens.hashToken(refreshToken), // create the hash then pass into Dal
        expiresAt: tokens.getExpiry(refreshToken) // get the expiry then pas into Dal
    });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        accessToken,
        refreshToken,
    };
}
// loads the user again when request for new access token
async function refresh (refreshToken) {
    try {
        // verify if the signature is valid and token hasn't expired
        tokens.verifyRefreshToken(refreshToken);
    } catch (err) {
        throw createError('Invalid refresh token', 401);
    }
    // hash the given refreshToken, then checks in DB if it's a valid token
    const stored = await refreshTokenDal.findValidToken(tokens.hashToken(refreshToken));
    if (!stored) {
        throw createError('Invalid refresh token', 401);
    }

    const user = await userDal.findById(stored.user_id);
    if (!user) {
        throw createError('Invalid refresh token', 401);
    }
    return {
        accessToken: tokens.signAccessToken(user)
    };
}

async function logout (refreshToken) {
    await refreshTokenDal.revoke(tokens.hashToken(refreshToken));
}

async function getCurrentUser(id) {
    const user = await userDal.findById(id);
    if (!user) {
        throw createError('User not found', 404);
    }
    return user;
}

module.exports = { register, login, refresh, logout, getCurrentUser };