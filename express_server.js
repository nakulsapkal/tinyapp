const express = require("express");
const app = express();
const { generateRandomString, getUserByEmail, getUserByPassword, urlsOfUser } = require("./helpers");
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({ extended: true }));
var cookieSession = require('cookie-session')
const { name } = require("ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "nakSap2" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "nakSap1" }
};

const users = {
  "nakSap1": {
    id: "nakSap1",
    email: "nakul.sapkal@gmail.com",
    password: bcrypt.hashSync("pass", 10)
  },
  "nakSap2": {
    id: "nakSap2",
    email: "nakul.sapkal@yahoo.com",
    password: bcrypt.hashSync("word", 10)
  }
};


//Basic routes
app.get("/", (req, res) => {
  if (req.session.user_id !== undefined) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// CRUD operations

// CRUD operation - Read
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id]
  };

  if (templateVars.user_id !== undefined) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


// CRUD operation - Read
app.get("/urls/:shortURL", (req, res) => {

  if (req.session.user_id === undefined) {
    return res.status(403).send('Please login or register to visit following URL.');
  } else if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send('Sorry, request URL not found!');
  } else if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(403).send('Sorry, you do not have access to this URL!');
  }

  const templateVars = {
    user_id: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});


// CRUD operation - Create/Edit
app.post("/urls/:shortURL", (req, res) => {

  const user_id = req.session.user_id;

  if (user_id === undefined) {
    return res.status(403).send('Sorry, you are not allowed to edit this link!');
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});


// CRUD operation - Read
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    return res.status(403).send('Sorry, request URL is not found!');
  }

  const newlongURL = urlDatabase[shortURL].longURL;

  if (newlongURL) {
    return res.redirect(newlongURL);
  }
  res.status(404).send('url not found!');
});


// CRUD operation - Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;

  if (user_id === undefined) {
    return res.status(403).send('Sorry, you are not allowed to delete this link!');
  }

  delete urlDatabase[req.params.shortURL];
  return res.redirect("/urls");
});


// CRUD operation - Read
app.get("/urls", (req, res) => {
  const user_id = users[req.session.user_id];
  const urls = urlsOfUser(req.session.user_id, urlDatabase);

  const templateVars = {
    user_id,
    urls
  };
  res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body['longURL'];
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL,
    userID
  }
  res.redirect(`/urls/${shortURL}`);
});


// Authentication
//Login Route Check/Validate
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = getUserByPassword(password, email, users);
  if (!email) {
    return res.status(401).send('EmailId is  black!');
  } else if (!password) {
    return res.status(401).send('Password is  black!');
  } else if (!getUserByEmail(email, users)) {
    return res.status(401).send('Sorry, the user is not registered!');
  } else if (!user_id) {
    return res.status(401).send('Wrong credentials!');
  }

  req.session.user_id = user_id;
  res.redirect("/urls");
});

//Login Route Read
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

//Register Route Read
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id]
  };
  res.render("register", templateVars);
});


//Register Route Validate/Register
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const inputPassword = req.body.password;
  if (!email || !inputPassword) {
    return res.status(403).send('Please insert all mandatory credential!');
  } else if (getUserByEmail(email, users)) {
    return res.status(403).send('Sorry, the user is already registered');
  }

  const password = bcrypt.hashSync(inputPassword, 10);
  const newUser = { userID, email, password };
  users[userID] = newUser;

  req.session.user_id = userID;
  res.redirect("/urls");
});

//Logout Route 
app.post('/logout', (req, res) => {

  req.session = null;

  res.redirect("/urls");
});