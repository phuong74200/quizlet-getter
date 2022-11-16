const express = require('express');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'pug');

const PORT = process.env.PORT || 7420;

const CloudflareBypasser = require('cloudflare-bypasser');
const cf = new CloudflareBypasser();

const getPaging = (id) => {
    const URL = `https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D=${id}&filters%5BstudiableContainerType%5D=1&perPage=555&page=1`;
    return cf.request(URL)
        .then(res => JSON.parse(res.body).responses);
}

const getFullQuizz = async (id) => {
    return getPaging(id)
        .then(res => res[0].paging.total)
        .then(total => {
            const URL = `https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D=${id}&filters%5BstudiableContainerType%5D=1&perPage=${total}&page=1`;
            return cf.request(URL)
                .then(res => JSON.parse(res.body));
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

app.get('/', async (req, res) => {
    try {
        let id = decodeURIComponent(req.query.id);

        if(validURL(id)) {
            id = id.match('\/([0-9]+)\/')[1];
        }

        console.log(id)

        const results = await getFullQuizz(id);
        const items = results.responses[0].models.studiableItem
        // return res.json(results.responses);
        return res.render('index', { items })
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            message: 'id not found'
        });
    }
});

app.listen(PORT, () => {
    console.log('listening on port ' + PORT);
});