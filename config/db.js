const mongoose = require("mongoose");

module.exports = async () => {
  try {
    const connection = await mongoose.connect(process.env.DB_URI);
    console.log(`DB ${connection.connection.name} connected at host ${connection.connection.host}`);
  } catch (err) {
    console.error(`DB Connection Error: ${err}`);
    process.exit(1);
  }
};
