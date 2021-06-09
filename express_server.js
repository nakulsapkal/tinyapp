const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
var cookieParser = require('cookie-parser');
const { name } = require("ejs");
app.use(cookieParser())
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["user_id"],
  };
  res.render("urls_new", templateVars);
  console.log(req.cookies)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  }

  res.send("URL not found in datbase!");
  console.log(req.cookies)
})


app.get("/urls", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
  console.log(req.cookies)
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
  console.log(req.cookies)
});

app.get("/", (req, res) => {
  res.send("Hello!");

  console.log(req.cookies)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  console.log(req.cookies)
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body;

  urlDatabase[shortURL] = longURL.longURL;
  res.redirect(longURL.longURL);
  console.log(req.cookies)
})

function generateRandomString() {
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}


app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");
});


app.post("/urls/:shortURL/delete", (req, res) => {

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post('/login', (req, res) => {

  res.cookie("username", req.body.username);

  res.redirect("/urls");

  console.log(req.cookies)
})


app.post('/logout', (req, res) => {

  res.clearCookie("user_id");

  res.redirect("/urls");

})


app.get("/register", (req, res) => {
  const templateVars = {
    username: users[req.cookies["user_id"]]
  };
  res.render("user_registration", templateVars);
});

const getUserByEmail = function(email) {
  //const key = Object.keys(users);
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
}

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  console.log(users);
  if (!email || !password) {
    res.statusCode = 400;
    return res.send('Email Id or Password is blank!');
  } else if (getUserByEmail(email)) {
    res.statusCode = 400;
    return res.send('Email Id already exists!');
  }
  const newUser = { userID, email, password };
  users[userID] = newUser;

  res.cookie("user_id", userID);
  res.redirect("/urls");

})