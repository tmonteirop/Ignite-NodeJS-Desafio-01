const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const { response, request } = require("express");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExist = users.some((user) => user.username === username);

  if (userAlreadyExist) {
    return response.status(400).json({ error: "Username already exists!" });
  }

  const newUser = { id: uuidv4(), name, username, todos: [] };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const newTodo = {
    id: uuidv4(), // precisa ser um uuid
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(new Date().setUTCHours(0, 0, 0, 0)),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const { title, deadline } = request.body;

  const todoForUpdate = user.todos.find((todo) => todo.id === id);

  if (todoForUpdate) {
    todoForUpdate.title = title;

    todoForUpdate.deadline = new Date(deadline);

    return response.json(todoForUpdate);
  }

  return response.status(404).json({ error: "Update action- Id not found!" });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todoForPatch = user.todos.find((todo) => todo.id === id);

  if (todoForPatch) {
    todoForPatch.done = true;
    return response.json(todoForPatch);
  }

  return response.status(404).json({ error: "Patch action- Id not found!" });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todoForDelete = user.todos.find((todo) => todo.id === id);

  if (todoForDelete) {
    user.todos.splice(todoForDelete, 1);

    return response.status(204).send();
  }

  return response.status(404).json({ error: "Delete action- Id not found!" });
});

module.exports = app;
