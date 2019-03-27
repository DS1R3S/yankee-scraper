var express = require("express");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();


// Configure middleware

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));


// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/yankees", { useNewUrlParser: true });


// Routes
// Get route for scraping yankees website
app.get('/scrape', function (req, res) {
    axios.get('https://www.mlb.com/yankees/news').then(function (response) {

        var $ = cheerio.load(response.data);

        $('li.article-navigation__item').each(function (i, element) {
            var result = {};
            
            result.title = $(this).find('span').text().replace('\n', ' ').trim();
            result.link = 'https://www.mlb.com/yankees' + $(this).children().attr('href');

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });

        });
        res.send('Scrape Complete')
    });
});

app.get('/articles', function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});


// axios.get('https://www.mlb.com/yankees/news').then(function (response) {
//     var $ = cheerio.load(response.data);

//     var result = []
//     $('li.article-navigation__item').each(function (i, element) {
//         var title = $(element).find('span').text().replace('\n', ' ').trim();
//         var link = $(element).children().attr('href');
//         link = 'https://www.mlb.com/yankees'+ link;

//         result.push({
//             title: title,
//             link: link
//         })
//     });
//     console.log(result);
// });