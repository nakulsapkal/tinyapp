const bcrypt = require('bcrypt');


const generateRandomString = function() {
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

const getUserByEmail = function(email, userDatabase) {
  for (let key in userDatabase) {
    if (userDatabase[key].email === email) {
      return true;
    }
  }
  return false;
}

const getUserByPassword = function(password, email, userDatabase) {
  for (let key in userDatabase) {
    if ((bcrypt.compareSync(password, userDatabase[key].password)) && (userDatabase[key].email === email)) {
      return key;
    }
  }
  return false;
}

const urlsForUser = function(id, userUrlDatabase) {
  const userUrls = {};
  for (key in userUrlDatabase) {
    if (userUrlDatabase[key].userID === id) {
      userUrls[key] = userUrlDatabase[key];
    }
  }
  return userUrls;
}


module.exports = { generateRandomString, getUserByEmail, getUserByPassword, urlsForUser };