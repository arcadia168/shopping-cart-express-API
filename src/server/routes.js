// grab the book model we just created
var ShoppingCartItem = require('./models/shoppingCartItem');
var uuidv1 = require('uuid/v1');

module.exports = function (app) {

    // server routes ===========================================================
    // handle things like api calls
    // Endpoint for adding an item.
    app.post('/api/shopping_cart_item', (req, res) => {
        //Update the store of itmes in the collection.
        const shoppingCartItemBody = req.body;
        const newItemId = uuidv1();
        console.log(newItemId);
        shoppingCartItemBody.id = newItemId;
        shoppingCartItemBody.session = req.session.id;
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
                console.log(`An error occurred when attempting to upsert: ${JSON.stringify(newShoppingCartItem)}`);
                res.sendStatus(500);
            } else {
                console.log(`${JSON.stringify(outcome.n)} records upserted`);
                res.sendStatus(200);
            }
        }).catch(error => {
            console.error(`An error occurred when upserting: ${error.message}`);
            res.sendStatus(500);
        });
    });

    // route to handle creating goes here (app.post)
    // route to handle delete goes here (app.delete)
    app.delete('/api/shopping_cart_item/:item_id', (req, res) => {
        const itemIdToDelete = req.params.item_id;
        console.log(`itemToDelete is: ${itemIdToDelete}`);

        ShoppingCartItem.deleteOne({ id: itemIdToDelete }).then(
            outcome => {
                if (outcome.ok !== 1) {
                    console.log(`An error occurred when attempting to delete: ${itemIdToDelete}`);
                    res.sendStatus(400);
                } else {
                    console.log(`${JSON.stringify(outcome.deletedCount)} records deleted`);
                    res.sendStatus(200);
                }
            }
        ).catch(error => {
            console.error(`An error occurred when deleting: ${error.message}`);
            res.sendStatus(500);
        });
    });
}
