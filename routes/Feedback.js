// packages imports
const express = require("express");
const router = express.Router();

// Local imports
const { feedback } = require("../models/Feedback");
const { FeedbackValidate } = require("../middlewares/FeedbackValidator");
const messages = require("../config/messages");
const { UserAuth } = require("../middlewares/AuthValidator");

// get feedbacks
router.get("/get-feedbacks", async (req, res) => {
	try {
		// Get feedbacks and owner details
		const feedbacks = await feedback.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "owner_id",
					foreignField: "_id",
					as: "owner_details",
				},
			},
			// unwind: "$owner_details"
			{
				$unwind: "$owner_details",
			},
			// Keep only the fields we need
			{
				$project: {
					_id: 1,
					feedback: 1,
					owner_details: {
						_id: 1,
						name: 1,
						email: 1,
						phone: 1,
						profile_picture: 1,
					},
					feedback_datetime: 1,
				},
			},
		]);

		// return response
		return res.send({ feedbacks: feedbacks, message: "List of feedbacks" });
	} catch (error) {
		// return error response
		return res.status(500).send({ message: messages.serverError });
	}
});

// post a feedback
router.post("/post-feedback", UserAuth, FeedbackValidate, async (req, res) => {
	try {
		// Create new feedback
		const newFeedBack = new feedback({
			feedback: req.body.feedback,
			owner_id: req.body.user_details._id,
		});

		// Save feedback
		await newFeedBack.save();

		// return response
		return res.send({ feedback: newFeedBack, message: "Feedback Posted Successfully" });
	} catch (error) {
		// return error response
		return res.status(500).send({ message: messages.serverError });
	}
});

module.exports = router;
