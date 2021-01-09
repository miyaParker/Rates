const axios = require('axios');
const express = require('express');

const port = process.env.PORT || 5000
const app = express();
const postRouter = express.Router()

const fetchRates = async () => {
    const res = await axios.get(`https://api.exchangeratesapi.io/latest`)
    return res.data
}

postRouter.route('/rates')
    .get((request, response) => {
        let { base, currency } = request.query
        if ((base === undefined || currency === undefined) || (base === "" || currency === "")) {
            response.status(400)
            response.send("base and currency are required")
        }
        else {
            fetchRates()
                .then(data => {
                    const currencyArray = currency.split(',')
                    const filterData = (rates) => {
                        let obj = {}
                        for (currency in currencyArray) {
                            obj[currencyArray[currency]] = rates[currencyArray[currency]]
                        }
                        return obj
                    }
                    const filtered = filterData(data.rates)
                    const responseObject = {
                        results: {
                            "base": base,
                            "date": data.date,
                            "rates": filtered
                        }
                    }
                    response.setHeader("Content-Type", "application/json")
                    response.status(200).send(JSON.stringify(responseObject))
                })
                .catch(error=>console.error(error.message))
        }
    })

app.use('/api', postRouter)
app.listen(port, () => console.log(`listening on port ${port}`))

