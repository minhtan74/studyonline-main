const jwt = require('jsonwebtoken');
const { secret, expire } = require('../config/jwt');

function sign(payload) {
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: expire });
}

function verify(token) {
  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch (e) {
    return null;
  }
}

module.exports = { sign, verify };
