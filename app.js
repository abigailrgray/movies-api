import express from 'express'
import { pool } from './database.js';
import {sql} from '@databases/pg';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = 3003;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());


// app.get('/movies', async (req, res) => { 
//     const movies = await pool.query(sql`SELECT * FROM movie_critic.movie_data`);
//     console.log(JSON.stringify(movies))
//     res.json(movies);
// });

app.post('/add-movie', async (req, res) => {
  const data = req.body;
  console.log(data);
  const id = data.id, title = data.title, poster_path = data.poster_path;

  const query = sql`INSERT INTO movie_critic.movie_data(movie_id, movie_title, poster_url) VALUES (${id}, ${title}, ${poster_path}) RETURNING *`;
  const newMovie = await pool.query(query);
  console.log(newMovie[0]);
  res.json(newMovie);
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});