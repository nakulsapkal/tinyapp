const bcrypt = require('bcrypt');

//This functions helps generating random unique string 
const generateRandomString = function() {
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

//This functions help in verifying the user using the emailId provided. 
const getUserByEmail = function(email, userDatabase) {
  for (let key in userDatabase) {
    if (userDatabase[key].email === email) {
      return key;
    }
  }
  return false;
}

//This functions help in verifying the user using the emailId provided and if the password matches to that emailID. 
const getUserByPassword = function(password, email, userDatabase) {
  for (let key in userDatabase) {
    if ((bcrypt.compareSync(password, userDatabase[key].password)) && (userDatabase[key].email === email)) {
      return key;
    }
  }
  return false;
}


//This functions helps to get back the objcet of user to know its user created url's 
const urlsOfUser = function(id, userUrlDatabase) {
  const userUrls = {};
  for (key in userUrlDatabase) {
    if (userUrlDatabase[key].userID === id) {
      userUrls[key] = userUrlDatabase[key];
    }
  }
  return userUrls;
}


module.exports = { generateRandomString, getUserByEmail, getUserByPassword, urlsOfUser };