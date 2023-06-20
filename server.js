import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set('port', 5000);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/task', (req, res) => {
  fs.readFile('task.txt', (err, data) => {
    if (err) return console.log(err);
    const listString = data.toString().split(/\n/g);
    const list = listString.map(z => {
      const [name, done] = z.split(',');
      return { name, done };
    });
    res.json({ tasks: list });
  });
});

app.post('/task', (req, res) => {
  const { name } = req.body;
  if (name) {
    if (!fs.existsSync('task.txt')) {
      fs.appendFile('task.txt', `${name},false\n`, (err) => {
        if (err) console.log(err);
        const allTask = [{ name, done: false }];
        res.json({ msn: 'Tarea creada', tasks: allTask });
      });
    } else {
      fs.readFile('task.txt', (err, data) => {
        if (err) return console.log(err);
        const listString = data.toString().split(/\n/g);
        const list = listString.map(z => {
          const [taskName, done] = z.split(',');
          return { name: taskName, done: done === 'true' };
        });
        if (!list.some(item => item.name === name)) {
          fs.appendFile('task.txt', `${name},false\n`, (err) => {
            if (err) console.log(err);
            const allTask = [...list, { name, done: false }];
            res.json({ msn: 'Tarea creada', tasks: allTask });
          });
        } else {
          res.json('Tarea ya existe');
        }
      });
    }
  }
});

app.listen(app.get('port'), () => {
  console.log(`Server is running on port ${app.get('port')}`);
});
