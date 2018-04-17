const expect = require("expect");
const request = require("supertest");

const { app } = require("../server");
const { Todo } = require("./../models/todo");

describe("Post /todos", () => {
  it("should create a new todo", done => {
    request()
      .post("/todos")
      .send({ text: "hello" })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe("hello");
      })
      .end(done());
  });
});
