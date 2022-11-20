const yargs = require('yargs/yargs');
const cloudscraper = require('cloudscraper');
const { hideBin } = require('yargs/helpers');
const mongoose = require('mongoose');
const CardModel = require('../model/card.model')

/**
 * 
 * How to use?
 * node ./cli/quizzlet.js --id=384385677
 */

const get = (id) => {
    const URL = `https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D=${id}&filters%5BstudiableContainerType%5D=1&perPage=99999&page=1`;
    return cloudscraper.get(URL)
        .then(res => JSON.parse(res));
}

const argv = yargs(hideBin(process.argv)).argv;

try {
    console.log('- Connectting to db');
    mongoose.connect('mongodb+srv://admin:admin@cluster0.ehugr.mongodb.net/quizlet-db').then(async () => {
        console.log('- db connected');
        console.log('- getting quizlet id', argv.id);
        const results = await get(argv.id);
        const items = results.responses[0].models.studiableItem;

        for(let item of items) {
            const media = item.cardSides.map(card => card.media[0].plainText);
            new CardModel({
                mediaId: item.id,
                quizId: argv.id,
                media: media,
            }).save();
        }
    });
} catch(err) {
    console.log(err);
}