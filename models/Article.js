var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ArticleSchema = new Schema ({

	title: {
		type: String,
		required: true
	},

	link: {
		type: String,
		required: true,
		unique: true
	},

	summary: {
		type: String,
		required: true
	},

	updated: {
		type: String
	},

	comments: [{
		type: Schema.Types.ObjectId,
		ref: "Comment"
	}]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;