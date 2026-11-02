// admin dashboard login: checks the email, the password AND that the account is an admin

const bcrypt = require('bcrypt');
const userDal = require('../dal/userDal');
const tokens = require('../utils/tokens');

// gives back a signed admin token, or null if this login is not allowed
async function loginAdmin(email, password) {
    if (!email || !password) {
        return null; // a form field was left empty
    }
    const user = await userDal.findByEmail(email.trim().toLowerCase());
    if (!user) {
        return null; // no account with this email
    }
    const passwordCheck = await bcrypt.compare(password, user.password_hash);
    if (!passwordCheck) {
        return null; // wrong password
    }
    if (user.role !== 'admin') {
        return null; // a real customer account, but customers cannot use the admin pages
    }
    return tokens.signAdminToken(user);
}

module.exports = { loginAdmin };
