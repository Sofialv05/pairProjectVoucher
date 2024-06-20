const bcrypt = require('bcryptjs')

async function encrypt(value) {
    return bcrypt.hash(value, bcrypt.genSaltSync(10))
}

async function compare(value, password) {
    return bcrypt.compare(value, password)
}

module.exports = { encrypt, compare }