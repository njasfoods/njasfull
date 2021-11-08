const { Router } = require("express");
const db = require("../db");

const router = Router();

router.get("/", async (req, res) => {
	try {
		const results = await db.query("SELECT * FROM cart WHERE user_id =$1", []);
		console.log(results["rows"]);
		if (results["rows"].length === 0) {
			console.log("empty nigga go shopping");
		} else {
			res.status(200).json({
				status: "success",
				results: results.rows.length,
				data: {
					cart: results["rows"],
				},
			});
		}
	} catch (err) {
		console.log(err);
		res.redirect("/");
	}
});

router.get("/:cart_id", async (req, res) => {
	console.log(req.params.cart_id);
	try {
		const results = await db.query("SELECT * FROM cart WHERE cart_id = $1", [
			req.params.cart_id,
		]);
		console.log(results.rows[0]);
		res.status(200).json({
			status: "success",
			results: results.rows.length,
			data: {
				cart: results.rows[0],
			},
		});
	} catch (err) {
		console.log(err);
		res.redirect("/");
	}
});

router.post("/add", async (req, res) => {
	const insertI = await db.query(
		" insert into cart (quantity, customer_id, product_id) values ($1,$2,$3) returning *",
		[req.body.quantity, req.customer_id, req.products_id]
	);
	res.json(insertI["rows"]);
});

router.put("/:cart_id", async (req, res) => {
	try {
		const results = await db.query(
			"UPDATE cart SET product = $1, price =$2 WHERE cart_id = $3 returning *",
			[req.body.product, req.body.price, req.params.cart_id]
		);
		console.log(results["rows"]);
		res.status(200).json({
			status: "success",
			results: results.rows.length,
			data: {
				cart: results["rows"],
			},
		});
	} catch (err) {
		console.log(err);
		res.redirect("/");
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const results = await db.query("DELETE FROM cart WHERE cart_id = $1", [
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
