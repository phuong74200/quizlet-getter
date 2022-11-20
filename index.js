const express = require('express');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'pug');

const PORT = process.env.PORT || 3000;

const cloudscraper = require('cloudscraper');

const getPaging = (id) => {
    const URL = `https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D=${id}&filters%5BstudiableContainerType%5D=1&perPage=555&page=1`;
    return cloudscraper({
        url: URL,
        method: 'GET',
        headers: {
            'proxy': 'http://localproxy.com',
            'User-Agent': 'Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36',
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

async function quizlet(id){
    let res = await fetch(`https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D=${id}&filters%5BstudiableContainerType%5D=1&perPage=5&page=1`).then(res => res.json())
    let currentLength = 5;
    let token = res.responses[0].paging.token
    let terms = res.responses[0].models.studiableItem;
    let page = 2;
    console.log({token, terms})
    while (currentLength >= 5){
        let res = await fetch(`https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D=${id}&filters%5BstudiableContainerType%5D=1&perPage=5&page=${page++}&pagingToken=${token}`).then(res => res.json());
        terms.push(...res.responses[0].models.studiableItem);
        currentLength = res.responses[0].models.studiableItem.length;
        token = res.responses[0].paging.token;
    }
    return terms;
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
        res.json(await quizlet(id))
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