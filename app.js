import {config} from './dbconfig.js'
import express from "express";
import 'dotenv/config'

import pkg from 'pg'
const {Client} = pkg;

const app = express()
app.use(express.json())
const PORT = 8000



app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/about', (req, res) => {
  res.send('About route 🎉 ')
})

app.get('/canciones', async (req, res) => {
  const client = new Client(config);
  await client.connect();
  let result = await client.query("select * from public.canciones");
  await client.end();
  console.log(result.rows);
  res.send(result.rows)

})

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})