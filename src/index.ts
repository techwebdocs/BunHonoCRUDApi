import { Hono } from "hono";
import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite");
db.run(
  "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT)"
);
const app = new Hono();

const port = parseInt(process.env.PORT) || 3000;

const home = app.get("/", (c) => {
  return c.json({ message: "Hello World!" });
});

app.get("/users", (c) => {
  const stmt = db.query("SELECT * FROM users");
  return c.json({ users: stmt.all()})
});

app.post('/user', async (c) => {
  const body = await c.req.parseBody()
  const name = body['name']
  const email = body['email']
  const password = body['password']

  c.set('name', name);
  c.set('email', email);
  c.set('password', password);

  const params = [name, email, password];
  const sql ="INSERT INTO users (name, email, password) VALUES (?,?,?)";
  db.run(sql,params);
  return c.json({ name: name, email: email, password: password})
});

app.put('/user/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  const name = body['name']
  const email = body['email']
  const password = body['password']

  c.set('name', name);
  c.set('email', email);
  c.set('password', password);

  const params = [name, email, password, id];
  const sql ="UPDATE users SET name=?,email=?, password=? WHERE id=?";
  db.run(sql,params);
  return c.json({ message: 'updated'})
});


app.get('/user/:id', (c) => {
  const id = c.req.param('id')
  const sql = "SELECT * FROM users WHERE id=?";
  const stmt = db.prepare(sql);
  return c.json({ user: stmt.all(id)})
  
});

app.delete('/user/:id', async (c) => {
  const id = await c.req.param('id')
  const sql = "DELETE * FROM users WHERE id=?";
  db.run(sql,id);
  return c.json({ message: 'deleted'})
  
});

console.log(`Running at http://localhost:${port}`);

export default {
  port,
  fetch: home.fetch,
};
