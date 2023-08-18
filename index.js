const express = require('express');
const cors = require('cors');
const port = 8000;
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const routerInit = require('./routers');

dotenv.config();
const app = express();

app.get('/', function (req, res) {
    res.json({ message: 'Server has started running', status: 'Running' });
});

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ROUTES USER
mongoose
    .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected!'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

/* Router Init */
routerInit(app);

app.listen(process.env.HOST_BUILD_LOCAL, () => {
    console.log(`Example app listening on  ${process.env.HOST_BUILD_LOCAL}`);
});
