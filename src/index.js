import express from "express";
import { v4 as uuid } from "uuid";

const app = express();
app.use(express.json());

const customers = [];

//Middlewares
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found!" });
  }

  request.customer = customer;
  return next();
}

//Functions
function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);
  return balance;
}

//Métodos HTTP
app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customersAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customersAlreadyExists) {
    return response.status(400).json({ error: "Customer already exists!" });
  }

  customers.push({
    id: uuid(),
    cpf,
    name,
    statement: [],
  });
  return response.status(201).send();
});

app.get("/account/list", (request, response) => {
  return response.status(200).json(customers);
});

app.use(verifyIfExistsAccountCPF);

app.get("/statement", (request, response) => {
  const { customer } = request;
  response.status(200).json(customer?.statement);
});

app.post("/deposit", (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  getBalance(customer.statement);

  customer.statement.push(statementOperation);
  return response.status(201).send();
});

app.post("/withdraw", (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient funds!" });
  }

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.get("/statement/date", (request, response) => {
  const { customer } = request;
  const { date } = request.headers;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );

  response.status(200).json(statement);
});

app.put("/account", (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
});

app.get("/account", (request, response) => {
  const { customer } = request;

  return response.status(200).json(customer);
});

app.delete("/account", (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(200).json(customers);
});

app.get("/balance", (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.status(200).json({ balance: balance });
});

app.listen(3333);
