const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const apiRoutes = require('../routes/api');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({extended: true}));
app.use('/photos', express.static(path.join(__dirname, '../uploads')));

app.use(bodyParser.json());
app.use(apiRoutes);

async function startServer() {
    try {
        await mongoose.connect(
            'mongodb+srv://sofia_guseva:0q1w2e3r4t5y@cluster0-2wjfx.mongodb.net/restApi2',
            {
                useFindAndModify: false,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            }
        )

        app.listen(PORT, () => {
            console.log(`Start server. Port ${PORT}`);
        })
    }catch (e) {
        console.log(e);
    }
}

startServer();