// Imports
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Routes
const HomeRoute = require("./routes");
const UserRoutes = require("./routes/users");
const ProductRoutes = require("./routes/products");
const CartRoutes = require("./routes/cart");

app.use("/", HomeRoute);
app.use("/users", UserRoutes);
app.use("/products", ProductRoutes);
app.use("/cart", CartRoutes);

//PORT
const PORT = process.env.PORT || 7000;
app.listen(PORT, () =>
	console.log(`Server listening on port: http://localhost:${PORT}`)
);
