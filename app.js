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

// Add new movie
app.post('/add-movie', async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const id = data.id, title = data.title, poster_path = data.poster_path, release_date = data.release_date, runtime = data.runtime, content_rating = data.content_rating;

    const query1 = sql`INSERT INTO movie_critic.movie_data(movie_id, movie_title, poster_url, release_date, runtime, content_rating) VALUES (${id}, ${title}, ${poster_path}, ${release_date}, ${runtime}, ${content_rating}) RETURNING *`;
    const newMovie = await pool.query(query1);
    res.json({"status":200, "row":newMovie[0]});
  }

  catch (error) {
    res.json({"status":400, "error": "Attempt to add movie was unsuccessful."})
  }
});

// Get all reviews with specified movie ID
app.get('/get-review-data/:movieid', async (req, res) => {
  const movieId = req.params.movieid
  const query = sql`SELECT review_id, username, review, rating FROM movie_critic.reviews WHERE movie_id = ${movieId}`
  const data = await pool.query(query);
  res.json(data)
})

// Get user review with specified review ID
app.get('/get-user-review/:reviewid', async (req, res) => {
  const reviewId = req.params.reviewid;
  const query = sql`SELECT review_id, username, review, rating FROM movie_critic.reviews WHERE review_id = ${reviewId}`
  const userReview = await pool.query(query);
  res.json(userReview[0]);
})

// Add new review
app.post('/add-review', async (req, res) => {
  try {
    const data = req.body;
    const query = sql`INSERT INTO movie_critic.reviews(movie_id, username, rating, review) VALUES (${data.movie_id}, ${data.username}, ${data.rating}, ${data.review})`;
    const query2 = sql`SELECT review_id, movie_id, username, review, rating FROM movie_critic.reviews WHERE movie_id = ${data.movie_id}`
    await pool.query(query);
    const allReviews = await pool.query(query2);
    res.json({"status":200, "reviews":allReviews});
  }
  catch (error) {
    console.error(error);
    res.json({"status":400, "error": "We were not able to add your review."})
  }
})

// Update review
app.patch('/update-review', async (req, res) => {
  try {
    const data = req.body;
    const query1 = sql`UPDATE movie_critic.reviews SET rating = ${data.rating}, review = ${data.review} WHERE review_id = ${data.review_id} RETURNING *`
    const query2 = sql`SELECT review_id, movie_id, username, review, rating FROM movie_critic.reviews WHERE movie_id = ${data.movie_id}`
    await pool.query(query1);
    const allReviews = await pool.query(query2);
    res.json({"status":200, "reviews": allReviews})
  }
  catch (error) {
    res.json({"status": 400, "error": "Your review was unable to be updated."})
  }
})

// Delete review
app.delete('/delete-review/:reviewid/:movieid', async (req, res) => {
  const reviewId = req.params.reviewid;
  const movieId = req.params.movieid;
  const query1 = sql`DELETE FROM movie_critic.reviews WHERE review_id = ${reviewId} RETURNING *`
  const query2 = sql`SELECT review_id, movie_id, username, review, rating FROM movie_critic.reviews WHERE movie_id = ${movieId}`
  await pool.query(query1);
  const allReviews = await pool.query(query2);
  res.json(allReviews);
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});