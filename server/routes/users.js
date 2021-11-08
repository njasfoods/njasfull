const { Router } = require("express");
const db = require("../db");
const { register } = require("../controller/register");
const { login } = require("../controller/login");

const router = Router();

router.post("/login", login);

router.get("/profile/:users_id", async (req, res) => {
	console.log(req.params.users_id);
	try {
		const results = await db.query("SELECT * FROM users WHERE users_id = $1", [
			req.params.users_id,
		]);
		console.log(results.rows[0]);
		res.status(200).json({
			status: "success",
			results: results.rows.length,
			data: {
				users: results.rows[0],
			},
		});
	} catch (err) {
		console.log(err);
		res.redirect("/");
	}
});

router.post("/register", register);
router.put("/profile/edit/:id", async (req, res) => {
	try {
		const results = await db.query(
			"UPDATE users SET firstName = $1, lastName =$2 WHERE users_id = $3 returning *",
			[req.body.firstName, req.body.lastName, req.params.id]
		);
		console.log(results["rows"]);
		res.status(200).json({
			status: "success",
			results: results.rows.length,
			data: {
				users: results["rows"],
			},
		});
	} catch (err) {
		console.log(err);
		res.redirect("/");
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const results = await db.query("DELETE FROM users WHERE users_id = $1", [
			req.params.id,
		]);
		console.log(results["rows"]);
		res.status(200).json({
			status: "success",
		});
	} catch (err) {
		console.log(err);
		res.redirect("/");
	}
});
module.exports = router;
