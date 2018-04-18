//Library Imports
let express = require("express");
let bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
//local imports
const { mongoose } = require("./db/mongoose");
const { Todo } = require("./models/todo");
const { User } = require("./models/user");

let app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

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

app.get("/todos/:id", (req, res) => {
  console.log(ObjectId);
  let id = req.params.id;
  if (ObjectId.isValid(id)) {
    Todo.findById(id).then(Todo => {
      if (Todo !== null) {
        return res.status(200).send({ Todo });
      }
      res.status(400).send({ error: "Todo not found" });
    });
  } else {
    return res.status(404).send();
  }
});

app.delete("/todos/:id", (req, res) => {
  let id = req.params.id;
  if (ObjectId.isValid(id)) {
    Todo.findByIdAndRemove(id).then(todo => {
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

app.listen(port, () => {
  console.log("Sever started on port 3000");
});

module.exports = { app };
