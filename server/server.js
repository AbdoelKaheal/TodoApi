//Library Imports
const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
//local imports
const { mongoose } = require("./db/mongoose");
const { Todo } = require("./models/todo");
const { User } = require("./models/user");
const { authenticate } = require("./middleware/authenticate");

let app = express();
app.disable("x-powered-by");
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.post("/todos", authenticate, (req, res) => {
  let newTodo = new Todo({ text: req.body.text, _creator: req.user._id });
  newTodo
    .save()
    .then(doc => {
      console.log("new todo added", doc);
      res.status(200).send(doc);
    })
    .catch(e => {
      console.log("todo could not be saved", e);
      res.status(400).send(e);
    });
});

app.get("/todos", authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  })
    .then(todos => {
      res.send({ todos }).status(200);
    })
    .catch(e => {
      res.send(e).status(400);
    });
});

app.get("/todos/:id", authenticate, (req, res) => {
  let id = req.params.id;
  if (ObjectId.isValid(id)) {
    Todo.findOne({ _id: id, _creator: req.user._creator }).then(Todo => {
      if (Todo !== null) {
        return res.status(200).send({ Todo });
      }
      res.status(400).send({ error: "Todo not found" });
    });
  } else {
    return res.status(404).send();
  }
});

app.delete("/todos/:id", authenticate, (req, res) => {
  let id = req.params.id;
  if (ObjectId.isValid(id)) {
    Todo.findOneAndRemove({ _id: id, _creator: req.user._id }).then(todo => {
      if (todo !== null) {
        res.send({ todo }).status(200);
      } else {
        res.status(404).send({ error: "object id could not be found" });
      }
    });
  } else {
    res.status(404).send({ error: "Invalid object id" });
  }
});

app.patch("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  let body = _.pick(req.body, ["text", "completed"]);
  if (!ObjectId.isValid(id)) {
    return res.status(404).send({ error: "invalid ID" });
  }
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completedAt = null;
    body.completed = false;
  }

  Todo.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: body },
    { new: true }
  )
    .then(todo => {
      if (!todo) {
        return res.status(404).send({ error: "could not update todo" });
      }
      res.status(200).send(todo);
    })
    .catch(e => res.status(400).send(e));
});

/*  This is now for the users api  */

app.post("/users", (req, res) => {
  const body = _.pick(req.body, ["email", "password"]);
  let user = new User({
    email: body.email,
    password: body.password
  });

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      console.log(token);
      res
        .status(200)
        .header("x-auth", token)
        .send(user);
    })
    .catch(e => {
      console.log("error");
      res.status(400).send({ e });
    });
});

app.get("/users/me", authenticate, (req, res) => {
  res.send(req.user);
});

app.post("/users/login", (req, res) => {
  console.log(req.body);
  User.findByCredentials(req.body.email, req.body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res
          .status(200)
          .header("x-auth", token)
          .send(user);
      });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.delete("/users/me/token", authenticate, (req, res) => {
  let user = req.user;
  console.log("hello");
  user
    .removeToken(req.token)
    .then(() => {
      res.send();
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.listen(port, () => {
  console.log("Sever started on port 3000");
});
