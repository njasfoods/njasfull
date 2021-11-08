const { Router } = require("express");

const db = require("../db");

const router = Router();

router.get("/", async (req, res) => {
	res.send("Hello homepage");
});

module.exports = router;
