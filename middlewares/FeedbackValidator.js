// function to validate the feedback post body
const FeedbackValidate = (req, res, next) => {
	if (!req.body.feedback) return res.status(400).send({ message: "Feedback is required" });

	if (typeof req.body.feedback !== "string")
		return res.status(400).send({ message: "Feedback must be a string" });

	next();
};

// Exports
exports.FeedbackValidate = FeedbackValidate;
