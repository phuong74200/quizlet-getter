const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'pug');

const PORT = process.env.PORT || 7420;

const cloudscraper = require('cloudscraper');

const CardModel = require('./model/card.model')

app.get('/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const items = await CardModel.find({ quizId: id });
        return res.render('index', { items });
    } catch (err) {
        return res.json({
            code: 500,
            message: 'id not found',
            err: err.message
        });
    }
});

mongoose.connect('mongodb+srv://admin:admin@cluster0.ehugr.mongodb.net/quizlet-db').then(() => {
    app.listen(PORT, () => {
        console.log(process.version);
        console.log('listening on port ' + PORT);
    });
});