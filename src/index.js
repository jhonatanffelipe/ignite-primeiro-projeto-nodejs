import express from "express";

const app = express();

app.use(express.json());
app.get("/courses", (request, response) => {
  const query = request.query;
  console.log(query);
  return response.json(["Curso 1", "Curso 2", "Curso 3"]);
});

app.post("/courses", (request, response) => {
  const courses = ["Curso 1", "Curso 2", "Curso 3"];
  const { name } = request.body;
  courses.push(name);

  return response.json(courses);
});

app.put("/courses/:id", (request, response) => {
  const courses = ["Curso 6", "Curso 2", "Curso 3", "Curso 4"];
  const { id } = request.params;

  return response.json([courses[id - 1]]);
});

app.patch("/courses/:id", (request, response) => {
  return response.json(["Curso 6", "Curso 7", "Curso 3", "Curso 4"]);
});

app.delete("/courses/:id", (request, response) => {
  return response.json(["Curso 6", "Curso 7", "Curso 4"]);
});

app.listen(3333);
