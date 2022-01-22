const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080

const generateScraperURL = (api_key) => `http://api.scraperapi.com?api_key=${api_key}&autoparse=true&render=true`;

app.use(express.json());

app.get('/', async (req, res) => {
    res.send('<h1>Welcome to Rightstuf scrapper API</h1>')
})

// GET Search Results
app.get('/api/search/:searchQuery', async (req, res) => {
    const { searchQuery } = req.params;
    const {api_key} = req.query

    try{
        //const response = await request(`${baseURL}&url=https://www.amazon.com/dp/${productId}`);
        if(api_key === undefined){
            res.json({
                message: "ERROR: Please enter api key in URL",
                status: 404
            })
        } else {
            const response = await axios.get(`https://www.rightstufanime.com/api/items?c=546372&country=US&currency=USD&fieldset=search&include=facets&language=en&limit=12&n=2&offset=0&pricelevel=5&q=${searchQuery}&sort=relevance%3Aasc&use_pcv=F`)
            //const response = await axios.get(`${generateScraperURL(api_key)}&url=https://www.rightstufanime.com/search?show=96&keywords=${searchQuery}`);
            const items = response.data.items
            const itemArray = []

            await items.map(item => {
                //variables that output data depending on the conditions
                let tempRating = (item) =>{
                    if(item.custitem_ns_pr_rating == undefined || item.custitem_ns_pr_rating === null || item.custitem_ns_pr_rating === 0){
                        return ''
                    } else{
                        return item.custitem_ns_pr_rating
                    }

                }
                let tempReleaseTag = (item) => {
                    if(item.custitem_rs_new_releases_preorders === undefined || item.custitem_rs_new_releases_preorders == null){
                        return ''
                    } else {
                        return item.custitem_rs_new_releases_preorders
                    }
                }
                //pushes JSON objects to empty array
                itemArray.push({
                    name: item.storedisplayname,
                    type: item.custitem_rs_web_class,
                    genre: item.custitem_rs_genre,
                    sku: item.upccode,
                    description: item.storedescription,
                    img_URL: item.itemimages_detail,
                    item_url: `https://www.rightstufanime.com/${item.urlcomponent}`,
                    release_date: item.custitem_rs_release_date,
                    rating: tempRating(item),
                    msrp: item.pricelevel1,
                    salePrice: item.pricelevel2,
                    currentPrice: item.onlinecustomerprice,
                    ispurchasable: item.ispurchasable,
                    instock: item.isinstock,
                    backorder: item.custitem_rs_publisher_backorder,
                    top_selling: item.custitem_rs_top_selling_item,
                    purchaseable: item.custitem_rs_availabe_for_purchase,
                    release_tag: tempReleaseTag(item),
                    outofstock_msg: item.outofstockmessage,
                    stock_msg: item.stockdescription,
                })
            })

            if(itemArray.length === 0){
                res.json({
                    'message': `Sorry, we couldnt find any products!`,
                    'search_term': `${searchQuery}`,
                    'date': new Date(),
                    'status': 404
                })
            } else {
                //res.json(itemArray)
                //res.json(response.data)
                res.json({
                    'total': response.data.total,
                    'items': itemArray,
                    'paging': response.data.links
                })
            }
            //console.log(array)
            //res.json(response.data)
            //res.json(array)
        }

    } catch(error){
        res.json(error)
    }
})

app.listen(PORT,() =>{
    console.log(`Server is running on PORT ${PORT}`)
});