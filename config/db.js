const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("DB Connected");
  } catch (err) {
    console.error(`DB Connection Error: ${err}`);
    process.exit(1);
  }
};
