require("dotenv").config();

const app = require("./src/app");
const connectDatabase = require("./src/config/database");

connectDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});