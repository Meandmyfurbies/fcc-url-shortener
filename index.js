require('dotenv').config();
const bodyParser = require("body-parser");
const express = require('express');
const cors = require('cors');
const app = express();
const CreateURL = require("url").URL;
const validURL = require("valid-url");
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const urlSchema = new mongoose.Schema({
        url: {
                type: String,
                required: true
        }
});

const URL = mongoose.model("URL", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

function validateUrl(urlString) {
        console.log(urlString);
        return (validURL.isWebUri(urlString) != undefined);
};
console.log(validateUrl("ftp:/john-doe.invalidTLD"));
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  if(validateUrl(req.body.url)) {
          const urlToShorten = new URL({url: req.body.url});
          urlToShorten.save((err, data) => {
                  if(err) return console.error(err);
          });
          res.json({original_url: req.body.url, short_url: urlToShorten._id});
  } else {
          res.json({error: "invalid url"});
  }
});
app.get('/api/shorturl/:urlid', async function(req, res) {
  try {
          const urlDoc = await URL.findById(req.params.urlid);
          if(urlDoc != null) {
                  res.redirect(urlDoc.url);
          } else {
                  res.send("URL not found");
          }
  } catch {
          res.send("Error finding URL");
  }
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
