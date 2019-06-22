var ShoppingCartItem = require('./models/shoppingCartItem');
var uuidv1 = require('uuid/v1');

module.exports = function (app) {

    // server routes ===========================================================
    app.post('/api/shopping_cart_item', (req, res) => {
        const shoppingCartItemBody = req.body;
        const newItemId = uuidv1();
        console.log(newItemId);
        shoppingCartItemBody.id = newItemId;
        shoppingCartItemBody.basketId = req.session.id;
        const newShoppingCartItem = new ShoppingCartItem(shoppingCartItemBody);

        ShoppingCartItem.updateOne(
            {
                title: newShoppingCartItem.title
            },
            {
                $setOnInsert: newShoppingCartItem
            },
            {
                upsert: true
            },
        ).then(outcome => {
            if (outcome.ok !== 1) {
                console.error(`An error occurred when attempting to upsert: ${JSON.stringify(newShoppingCartItem)}`);
                res.sendStatus(500);
            } else {
                console.info(`${JSON.stringify(outcome.n)} records upserted`);
                res.sendStatus(200);
            }
        }).catch(error => {
            console.error(`An error occurred when upserting: ${error.message}`);
            res.sendStatus(500);
        });
    });

    app.delete('/api/shopping_cart_item/:item_id', (req, res) => {
        const itemIdToDelete = req.params.item_id;
        console.info(`itemToDelete is: ${itemIdToDelete}`);

        ShoppingCartItem.deleteOne({ id: itemIdToDelete }).then(
            outcome => {
                if (outcome.ok !== 1) {
                    console.error(`An error occurred when attempting to delete item: ${itemIdToDelete}`);
                    res.sendStatus(400);
                } else {
                    console.info(`${JSON.stringify(outcome.deletedCount)} records deleted`);
                    res.sendStatus(200);
                }
            }
        ).catch(error => {
            console.error(`An error occurred when deleting: ${error.message}`);
            res.sendStatus(500);
        });
    });

    app.delete('/api/shopping_cart/:basket_id', (req, res) => {
        const basketToDelete = req.params.basket_id;
        console.log(`basketToDelete is: ${basketToDelete}`);

        ShoppingCartItem.deleteMany({ basketId: basketToDelete }).then(
            outcome => {
                if (outcome.ok !== 1) {
                    console.error(`An error occurred when attempting to delete basket items: ${basketToDelete}`);
                    res.sendStatus(400);
                } else {
                    console.info(`${JSON.stringify(outcome.deletedCount)} basket items deleted`);
                    res.sendStatus(200);
                }
            }
        ).catch(error => {
            console.error(`An error occurred when deleting basket: ${error.message}`);
            res.sendStatus(500);
        });
    });

    app.get('/api/shopping_cart/:basket_id', (req, res) => {
        const basketToList = req.params.basket_id;
        console.log(`basketToList is: ${basketToList}`);

        const query = ShoppingCartItem.find(
            { basketId: basketToList },
            '-_id id title price basketId',
            (err, docs) => {
                if (err) {
                    console.error(`An error occurred when attempting to list basket items for: ${basketToList}`);
                    res.sendStatus(400);
                } else {
                    console.info(`${JSON.stringify(docs)} basket items listed`);
                    res.send(
                        docs
                    );
                }
            }
        );
    });

    app.get('/api/shopping_cart/totalbasketprice/:basket_id', (req, res) => {
        const basketToSum = req.params.basket_id;
        console.log(`basketToSum is: ${basketToSum}`);

        const query = ShoppingCartItem.find(
            { basketId: basketToSum },
            '-_id price',
            (err, basketItemPrices) => {
                if (err) {
                    console.error(`An error occurred when attempting to find total price of basket: ${basketToList}`);
                    res.sendStatus(400);
                } else {
                    console.info(`${JSON.stringify(basketItemPrices)} basket item prices found`);

                    // Find the sum total of the price of the items in the basket
                    let basketSum = 0;
                    // NB: Would have used a reducer here, but prices are within objects as .price properties.
                    basketItemPrices.forEach(basketItemPrice => basketSum += basketItemPrice.price);

                    console.info(`The sum total price of items in the basket ${basketToSum} is: ${basketSum}`);

                    res.send({
                        totalBasketPrice: basketSum,
                    });
                }
            }
        );
    });
}
