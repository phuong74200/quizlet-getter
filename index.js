const express = require('express');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'pug');

const PORT = process.env.PORT || 7420;

const cloudscraper = require('cloudscraper');

const getPaging = (id) => {
    const URL = `https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D=${id}&filters%5BstudiableContainerType%5D=1&perPage=555&page=1`;
    return cloudscraper({
        uri: URL,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0',
        }
    })
}

const getFullQuizz = async (id) => {
    return getPaging(id)
        .then(res => res[0].paging.total)
        .then(total => {
            const URL = `https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D=${id}&filters%5BstudiableContainerType%5D=1&perPage=${total}&page=1`;
            return cloudscraper.get(URL)
                .then(res => JSON.parse(res));
        })
}

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

app.get('/:id', async (req, res) => {
    try {
        let id = decodeURIComponent(req.params.id);

        if (validURL(id)) {
            id = id.match('\/([0-9]+)\/')[1];
        }

        const results = await getPaging(id).then(res => JSON.parse(res));

        const items = results.responses[0].models.studiableItem
        // return res.render('index', { items })
        res.json(await getPaging(id))
    } catch (err) {
        // console.log(err);
        return res.json({
            code: 500,
            message: 'id not found',
            err: err
        });
    }
});

app.listen(PORT, () => {
    console.log(process.version);
    console.log('listening on port ' + PORT);
});