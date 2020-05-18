import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const app = express();

// Hardcoded initial states
// const articlesInfo = {
//   'learn-react': {
//     upvotes: 0,
//     comments: [],
//   },
//   'learn-node': {
//     upvotes: 0,
//     comments: [],
//   },
//   'my-thoughts-on-resumes': {
//     upvotes: 0,
//     comments: [],
//   },
// }

app.use(bodyParser.json());

app.get('/api/articles/:name', async (req, res) => {
  try {
    const articleName = req.params.name;

    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
    // res.status(200).json({ message: 'here'});
    const db = client.db('my-blog');

    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    res.status(200).json(articleInfo);

    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Failed to connect to db ', error })
  }

})

app.post('/api/articles/:name/upvote', (req, res) => {
  const articleName = req.params.name;

  articlesInfo[articleName].upvotes += 1;
  res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes`);
})

app.post('/api/articles/:name/add-comment', (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;
  const timestamp = Date.now();

  articlesInfo[articleName].comments.push({ username, text, timestamp });
  res.status(200).send(articlesInfo[articleName]);
})

app.get('/hello', (req, res) => res.send("Hello! (Get Response)"));
app.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}!`))

app.post('/hello', (req, res) => res.send(`Hello ${req.body.name}!`));

app.listen(8000,() => console.log("listening on port 8000"));
