const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const {v4 : uuidv4} = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: "Admin@123"
  });

  let getRandomUser = () => {
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
    ];
}

app.get("/user", (req, res) => {
  let q = "SELECT * FROM user";
  try {
    connection.query(q, (err, result) => {
      if(err) {
        throw err;
      }
      res.render("user.ejs", {result});
    });
  } catch(err) {
    res.send("some error happend in DB");
  }
});

app.get("/user/:id/edit", (req, res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  
  try {
    connection.query(q, (err, result) => {
        if(err) {
          throw err;
        }
        let user = result[0];
        res.render("edit.ejs", {user});
    });
  } catch(err) {
    console.log(err);
    res.send("some random error happened");
  }
});

app.get("/", (req, res) => {
  let q = "SELECT COUNT(*) FROM user";
  try {
    connection.query(q, (err, result) => {
        if(err) {
          throw err;
        }
        let count = result[0]["COUNT(*)"];
        res.render("home.ejs", {count});
    });
  } catch(err) {
    console.log(err);
    res.send("some random error happened");
  }
});

app.patch("/user/:id", (req, res) => {
  let {id} = req.params;
  let {password: formPass, username: newUsername} = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  
  try {
    connection.query(q, (err, result) => {
        if(err) {
          throw err;
        }
        let user = result[0];
        if(formPass != user.password) {
          res.send("wrong password");
        } else {
          let q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`;
          connection.query(q2, (err, result) => {
            if(err) {
              throw err;
            }
            res.redirect("/user");
          });
        }
    });
  } catch(err) {
    console.log(err);
    res.send("some random error happened");
  }
});

app.get("/user/new", (req, res) => {
  res.render("newUser.ejs");
});

app.post("/user/newData", (req, res) => {
  let {username, password, email} = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}', '${username}', '${email}', '${password}')`;
  try {
    connection.query(q, (err, result) => {
      if(err) {
        throw err;
      }
      console.log(result);
      res.redirect("/user");
    });
  } catch(err) {
    res.send("error");
  }
});

app.get("/user/:id/delete", (req, res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      let user = result[0];
      res.render("deleteUser.ejs", {user});
    });
  } catch(err) {
    res.send("error");
  }
});

app.delete("/user/:id", (req, res) => {
  let {id} = req.params;
  let {password} = req.body;
  let q = `SELECT password FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if(err) {
        throw err;
      }
      let user = result[0];
      if(user.password != password) {
        res.send("wrong password");
      } else {
        let q2 = `DELETE FROM user WHERE id = '${id}'`;
          connection.query(q2, (err, result) => {
            if(err) {
              throw err;
            }
            res.redirect("/user");
          })
      }
    });
  } catch(err) {
    res.send("error");
  }
}); 


app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});