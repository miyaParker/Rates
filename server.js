const axios = require('axios');
const express = require('express');

const port = process.env.PORT || 5000
const app = express();
const postRouter = express.Router()

const fetchRates = async (base) => {
    const res = await axios.get(`https://api.exchangeratesapi.io/latest?base=${base}`)
    return res.data
}

postRouter.route('/rates')
    .get((request, response) => {
        let { base:baseCurrency, currency } = request.query
        if ((baseCurrency === undefined || currency === undefined) || (baseCurrency === "" || currency === "")) {
            response.status(400)
            response.send("base and currency are required")
        }
        else {
            fetchRates(baseCurrency)
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
                            "base": data.base,
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

