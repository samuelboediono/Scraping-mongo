var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');

var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');

var mongojs = require("mongojs");

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

router.get("/", function (req, res) {
	res.redirect("/scrape");
});

router.get("/articles", function (req, res) {
	Article.find().sort({_id: -1})
		.populate("comments")

		.exec(function(err, doc) {
			if (err) {
				console.log(err);
			}
			else {
				var hbsObject = {articles: doc}
				res.render("index", hbsObject);
			}
		});
});

router.get("/scrape", function (req, res) {
	request("https://news.ycombinator.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $(".title").each(function(i, element) {
      var title = $(element).children("a").text();
      var link = $(element).children("a").attr("href");

      if (title && link) {
        db.scrapedData.insert({
          title: title,
          link: link
        },
        function(err, inserted) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(inserted);
          }
        });
      }
    });
  });
  res.redirect("/articles");
});

router.post("/add/comment/:id", function (req, res) {
	var articleId = req.params.id;
	var commentWriter = req.body.name;
	var commentText = req.body.comment;

	var result = {
		author: commentWriter,
		content: commentText
	};

	var entry = new Comment (result);

	entry.save(function (err, doc) {
		if (err) {
			console.log(err);
		}

		else {
			Article.findOneAndUpdate({"_id": articleId}, {$push: {"comments":doc._id}}, {new: true})
			.exec(function (err, doc) {
				if (err) {
					console.log(err);
				}

				else {
					res.sendStatus(200);
				}
			});
		}
	});
});

router.post("/remove/comment/:id", function (req, res) {
	var commentName = req.params.id;

	Comment.findByIdAndRemove(commentName, function (err, todo) {
		if (err) {
			console.log(err);
		}

		else {
			res.sendStatus(200);
		}
	});
});


module.exports = router;