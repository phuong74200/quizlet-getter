const express = require('express');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'pug');

const PORT = process.env.PORT || 7420;

const cloudscraper = require('cloudscraper');

const CloudflareBypasser = require('cloudflare-bypasser');

let cf = new CloudflareBypasser();

const getPaging = (id) => {
    const URL = `https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D=${id}&filters%5BstudiableContainerType%5D=1&perPage=555&page=1`;
    return cf.request({
        url: URL,
        //  'User-Agent': 'Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0',
        headers: {
            // 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B554a Safari/9537.53',
            // host: 'fuong.quizlet.com'
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

        const results = await getPaging(id) //.then(res => JSON.parse(res.body));

        // const items = results.responses[0].models.studiableItem
        // return res.render('index', { items })
        res.json(await getPaging(id))
    } catch (err) {
        // console.log(err);
        return res.json({
            code: 500,
            message: 'id not found',
            err: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log(process.version);
    console.log('listening on port ' + PORT);
});