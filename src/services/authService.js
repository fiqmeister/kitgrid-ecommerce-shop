// The business rules/logic lives here

const bcrypt = require('bcrypt');
const userDal = require('../dal/userDal');
const createError = require('../utils/createError');

// destructuring: unpacks the req.body object 
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

module.exports = { register };