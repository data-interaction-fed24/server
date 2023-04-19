const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3001;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydatabase',
  password: '',
  port: 5432,
});

// Enable CORS
app.use(cors());
// Parse JSON requests
app.use(express.json());

// Enable CORS for a specific port only
// const corsOptions = { origin: 'http://localhost:3000' };
// app.use(cors(corsOptions));

// Routes

app.get('/api/my_table', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM my_table');
    res.json(result.rows);
  } catch (error) {
    console.error(error);

    // A response is sent to the client indicating that an error has occurred.
    res.status(500).send('Something went wrong');
  }
});

// Get by id

app.get('/api/my_table/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const queryText = 'SELECT * FROM my_table WHERE id = $1';
    const values = [id];
    const result = await pool.query(queryText, values);

    if (result.rows.length === 0) {
      res.status(404).send('Id not found');
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

// Create

app.post('/api/my_table', async (req, res) => {
  const name = req.body.name;

  try {
    const queryText = 'INSERT INTO my_table(name) VALUES($1) RETURNING *';
    const values = [name];
    const result = await pool.query(queryText, values);
    const record = result.rows[0];
    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

// Delete by id

app.delete('/api/my_table/:id', async (req, res) => {
  try {
    const queryText = 'DELETE FROM my_table WHERE id = $1 RETURNING *';
    const values = [req.params.id];
    const result = await pool.query(queryText, values);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Id not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

  // Update 

  app.put('/api/my_table/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const name = req.body.name;
  
      const queryText = 'UPDATE my_table SET name = $2 WHERE id = $1 RETURNING *';
      const values = [id, name];
      const result = await pool.query(queryText, values);
      const updatedRecord = result.rows[0];
  
      if (updatedRecord) {
        res.json(updatedRecord);
      } else {
        res.status(404).send('Id not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Something went wrong');
    }
  });

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
