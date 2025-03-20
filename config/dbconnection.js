const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then(() => console.log("DB Connected"))
    .catch((err) => {
      console.log(`DB Connection Error: ${err}`);
      process.exit(1);
    });
};

module.exports = connectDB;
