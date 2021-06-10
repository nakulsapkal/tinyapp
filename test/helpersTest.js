const { assert } = require('chai');
const bcrypt = require('bcrypt');


const { generateRandomString, getUserByEmail, getUserByPassword, urlsOfUser } = require("../helpers.js");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "nakSap2" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "nakSap1" }
};

const users = {
  "nakSap1": {
    id: "nakSap1",
    email: "nakul.sapkal@gmail.com",
    password: bcrypt.hashSync("password", 10)
  },
  "nakSap2": {
    id: "nakSap2",
    email: "nakul.sapkal@yahoo.com",
    password: bcrypt.hashSync("sa", 10)
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("nakul.sapkal@gmail.com", users)
    const expectedOutput = "nakSap1";

    assert.equal(user, expectedOutput);
  });

  it("should not return a user(return false) with invalid email", function() {
    const user = getUserByEmail("nakul.sapkal@g.com", users)
    const expectedOutput = false;

    assert.equal(user, expectedOutput);
  });

  it('should return false user with empty email input', function() {
    const user = getUserByEmail("", users)
    const expectedOutput = false;

    assert.equal(user, expectedOutput);
  });


});


describe('getUserByPassword', function() {
  it("should return a user with valid eamil and password", function() {
    const user = getUserByPassword("password", "nakul.sapkal@gmail.com", users)
    const expectedOutput = "nakSap1";

    assert.equal(user, expectedOutput);
  })


  it("should return false when eamil and password does not match(incorrect password)", function() {
    const user = getUserByPassword("passwor", "nakul.sapkal@gmail.com", users)
    const expectedOutput = false;

    assert.equal(user, expectedOutput);
  })

  it("should return false when eamil and password does not match(incorrect email)", function() {
    const user = getUserByPassword("password", "nakul@gmail.com", users)
    const expectedOutput = false;

    assert.equal(user, expectedOutput);
  })

  it("should return false with valid eamil and empty password", function() {
    const user = getUserByPassword("", "nakul.sapkal@gmail.com", users)
    const expectedOutput = false;

    assert.equal(user, expectedOutput);
  })


});



describe('urlsOfUser', function() {
  it("should return URL object associated with respective UserID", function() {
    const user = urlsOfUser("nakSap2", urlDatabase)
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "nakSap2" }
    }

    assert.deepEqual(user, expectedOutput);
  })

  it("should return URLS object empty associated with respective non existing UserID", function() {
    const user = urlsOfUser("nakSap3", urlDatabase)
    const expectedOutput = {}

    assert.deepEqual(user, expectedOutput);
  })

});

describe('generateRandomString', function() {
  it("should generate random string", function() {
    const generatedString = generateRandomString();

    assert.isString(generatedString);
  })

});