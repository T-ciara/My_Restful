require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/swagger");

const authRoutes    = require("./src/routes/auth.routes");
const parkingRoutes = require("./src/routes/parking.routes");
const carsRoutes    = require("./src/routes/cars.routes");
const reportsRoutes = require("./src/routes/reports.routes");
const usersRoutes   = require("./src/routes/users.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",    authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/cars",    carsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/users",   usersRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => res.json({ message: "Parking Management API is running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
