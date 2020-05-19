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

const withDB = async (operations, res) => {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
    const db = client.db('my-blog');

    await operations(db);

    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Failed to connect to db ', error })
  }
}

app.use(bodyParser.json());

app.get('/api/articles/:name', async (req, res) => {
    withDB ( async (db) => {
      const articleName = req.params.name;

      const articleInfo = await db.collection('articles').findOne({ name: articleName });
      res.status(200).json(articleInfo);
    }, res);

})

app.post('/api/articles/:name/upvote', async (req, res) => {
  withDB (async (db) => {
    const articleName = req.params.name;
    // Retrieve article info
    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    // Increment upvote value
    await db.collection('articles').updateOne( { name: articleName }, {
      '$set' : {
        upvote: articleInfo.upvote + 1,
      }
    });
    // Retrtieve updated artle info
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
    // Send updates article info back to the MongoClient
    res.status(200).json(updatedArticleInfo);
  }, res);
})

app.post('/api/articles/:name/add-comment', (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;
  const timestamp = Date.now();

  withDB( async (db) => {
    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    await db.collection('articles').updateOne( { name: articleName }, {
      '$set' : {
        comments: articleInfo.comments.concat({username, text}),
      }
    });
    // Retrtieve updated artle info
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
    // Send updates article info back to the MongoClient
    res.status(200).json(updatedArticleInfo);
  }, res)
});

app.get('/hello', (req, res) => res.send("Hello! (Get Response)"));
app.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}!`))

app.post('/hello', (req, res) => res.send(`Hello ${req.body.name}!`));

app.listen(8000,() => console.log("listening on port 8000"));
