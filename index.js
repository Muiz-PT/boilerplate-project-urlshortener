require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns').promises;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// solution
const generateShortUrl = (length = 9) => 
  Array.from({ length }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

let urlMap = new Map();

app.post("/api/shorturl", async (req, res) => {
  const url = req.body.url;

  try {
    const urlObject = new URL(url);

    // only allow http/https urls
    if (!["http:", "https:"].includes(urlObject.protocol)) {
      return res.json({ error: 'invalid url' });
    }

    try {
      // validate domain
      await dns.lookup(urlObject.hostname)

      // create new short URL
      const shortUrl = generateShortUrl();
      urlMap.set(shortUrl, url);

      return res.json({ original_url: url, short_url: shortUrl });
    } catch (error) {
      return res.json({ error: 'invalid url' });
    }
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const shortenedUrl = req.params.short_url;

  if (!urlMap.has(shortenedUrl)) {
    return res.status(404).json({ error: 'No short URL found' });
  }

  const originalUrl = urlMap.get(shortenedUrl);

  res.redirect(originalUrl);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
