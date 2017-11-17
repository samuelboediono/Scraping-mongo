var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');

var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');

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
	request("https://www.nytimes.com/", function (error, response, html) {

		var $ = cheerio.load(html);
		var titles = [];

		$("a.post-link-mask").each(function (i, element) {
			var result = {};
			result.title = $(element).text();
			result.link = $(element).children().attr("href");
			result.summary = $(this).children("div").text().trim() + "";

			if (result.title !== "" && result.summary !== "") {
				if(titles.indexOf(result.title) == -1) {
					titles.push(result.title);
					Article.count({ title: result.title}, function (err, test) {
						if(test == 0) {
							var entry = new Article (result);
							entry.save(function (err, doc) {
								if (err) {
									console.log (err);
								}
								else {
									console.log(doc);
								}
							});
						}

						else {
							console.log("Not saved to DB.")
						}
					});
				}

				else {
					console.log("Content is already there. Not saved to DB.")
				}
			}

			else {
				console.log("No content. Not saved to DB.")
			}
		});
		res.redirect("/articles");
	});
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