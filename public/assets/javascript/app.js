$(".add-comment-button").on("click", function() {
	var articleId = $(this).data("id");

	var baseURL = window.location.origin;

	var formName = "form-add-" + articleId;
	var form = $("#" + formName);

	$.ajax({
		url: baseURL + "/add/comment/" + articleId,
		type: "POST",
		data: form.serialize(),
	})
	.done(function() {
		location.reload();
	});
	return false;
});

$(".delete-comment-button").on("click", function() {

	var commentId = $(this).data("id");

	var baseURL = window.location.origin;
});

	$.ajax({
		url: baseURL + "/remove/comment/" + commentId,
		type: "POST",
	})
	.done(function () {
		location.reload();
	});

	return false;