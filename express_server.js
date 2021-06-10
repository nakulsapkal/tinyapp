const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({ extended: true }));
//var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session')
const { name } = require("ejs");
//app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
    password: bcrypt.hashSync("as", 10)
  },
  "nakSap2": {
    id: "nakSap2",
    email: "nakul.sapkal@yahoo.com",
    password: bcrypt.hashSync("sa", 10)
  }
};



function generateRandomString() {
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

const getUserByEmail = function(email) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
}

const getUserByPassword = function(password, email) {
  for (let key in users) {
    if ((bcrypt.compareSync(password, users[key].password)) && (users[key].email === email)) {
      return key;
    }
  }
  return false;
}

const urlsForUser = function(id) {
  const userUrls = {};
  for (key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
}


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase, users);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    //user_id: users[req.session["user_id"]]
    user_id: users[req.session.user_id]
  };

  if (templateVars.user_id !== undefined) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


app.get("/urls/:shortURL", (req, res) => {
  // const templateVars = { user_id: users[req.session["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  const templateVars = { user_id: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const newlongURL = urlDatabase[shortURL].longURL;

  if (newlongURL) {
    return res.redirect(newlongURL);
  }

  res.send("URL not found in datbase!");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;

  if (user_id !== undefined) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
  res.send('Cannot delete the link without login');

});


app.get("/urls", (req, res) => {
  const user_id = users[req.session.user_id];
  const urls = urlsForUser(req.session.user_id);

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


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = getUserByPassword(password, email);
  if (!email || !password) {
    res.statusCode = 403;
    return res.send('Email Id or Password is blank!');
  } else if (!getUserByEmail(email)) {
    res.statusCode = 403;
    return res.send('Email Id does not exists!');
  } else if (!user_id) {
    res.statusCode = 403;
    return res.send('Email ID or Password does not match!');
  }

  req.session.user_id = user_id;
  res.redirect("/urls");
});


app.get("/login", (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id]
  };
  res.render("login", templateVars);
});


app.get("/register", (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id]
  };
  res.render("register", templateVars);
});


app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const inputPassword = req.body.password;
  if (!email || !inputPassword) {
    res.statusCode = 400;
    return res.send('Email Id or Password is blank!');
  } else if (getUserByEmail(email)) {
    res.statusCode = 400;
    return res.send('Email Id already exists!');
  }

  const password = bcrypt.hashSync(inputPassword, 10);
  const newUser = { userID, email, password };
  users[userID] = newUser;

  req.session.user_id = userID;
  res.redirect("/urls");
});


app.post('/logout', (req, res) => {

  req.session = null;

  res.redirect("/urls");
});