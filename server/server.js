//Library Imports
let express = require("express");
let bodyParser = require("body-parser");

//local imports
const { mongoose } = require("./db/mongoose");
const { Todo } = require("./models/todo");
const { User } = require("./models/user");

let app = express();
app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  let newTodo = new Todo({ text: req.body.text });
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

app.get("/todos", (req, res) => {
  Todo.find()
    .then(todos => {
      res.send({ todos }).status(200);
    })
    .catch(e => {
      res.send(e).status(400);
    });
});

app.listen(3000, () => {
  console.log("Sever started on port 3000");
});

module.exports = { app };
