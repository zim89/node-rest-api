const app = require('./app');
const mongoose = require('mongoose');

const { DB_HOST, PORT } = process.env;

mongoose.set('strictQuery', true);
mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT || 4444, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
    console.log('Database connect success');
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
