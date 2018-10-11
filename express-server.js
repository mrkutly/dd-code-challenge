const express = require("@runkit/runkit/express-endpoint/1.0.0");
const converter = require("xml-js");
const cors = require("cors");
const querystring = require('querystring')
const request = require('request')

const app = express(exports);

const SEARCH_URL = "https://www.goodreads.com/search/index.xml?"

const formatResult = (result) => {
    return {
        id: result.best_book.id._text,
        title: result.best_book.title._text,
        author: result.best_book.author.name._text,
        image: result.best_book.image_url._text,
        reviewCount: result.text_reviews_count._text,
        rating: result.average_rating._text
    }
}

app.use(cors())

app.get("/books/search", (req, res) => {
    const qstring = querystring.stringify({ key: process.env.KEY, q: req.query.q, page: req.query.page })

    request.get(SEARCH_URL + qstring, (err, response, body) => {
        if (err) {
            res.status(500)
            res.json(err)
            return
        }

        const parsedBody = converter.xml2js(body, { compact: true })
        const results = parsedBody["GoodreadsResponse"]["search"]["results"]["work"]
        const formattedResults = results.map(result => formatResult(result))
        const end = parseInt(parsedBody["GoodreadsResponse"]["search"]["results-end"]["_text"])
        const lastResult = parseInt(parsedBody["GoodreadsResponse"]["search"]["total-results"]["_text"])
        const lastPage = (end === lastResult || end === lastResult - 1)

        res.status(200)
        res.json({ lastPage, results: formattedResults })
    })
})
