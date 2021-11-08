const { Router } = require("express");
const db = require("../db");

const router = Router();

router.get("/", async (req, res) => {
	try {
		const results = await db.query("SELECT * FROM products");
		console.log(results["rows"]);
		res.status(200).json({
			status: "success",
			results: results.rows.length,
			data: {
				products: results["rows"],
			},
		});
	} catch (err) {
		console.log(err);
        res.redirect("/");
	}
});

router.get("/:products_id", async (req, res) => {
	console.log(req.params.products_id);
	try {
		const results = await db.query("SELECT * FROM products WHERE products_id = $1", [
			req.params.products_id,
		]);
		console.log(results.rows[0]);
		res.status(200).json({
			status: "success",
			results: results.rows.length,
			data: {
				products: results.rows[0],
			},
		});
	} catch (err) {
		console.log(err);
        res.redirect("/");
	}
});

router.post("/", async (req, res) => {
	const insertI = await db.query(
		" insert into products (title, price) values ($1,$2) returning *",
		[req.body.title, req.body.price]
	);
	res.json(insertI["rows"]);
});

router.put("/:products_id", async (req, res) => {
	try {
		const results = await db.query(
			"UPDATE products SET title = $1, price =$2 WHERE products_id = $3 returning *",
			[req.body.title, req.body.price, req.params.products_id]
		);
		console.log(results["rows"]);
		res.status(200).json({
			status: "success",
			results: results.rows.length,
			data: {
				products: results["rows"],
			},
		});
	} catch (err) {
		console.log(err);
        res.redirect("/");
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const results = await db.query("DELETE FROM products WHERE products_id = $1", [
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
