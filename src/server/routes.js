// grab the book model we just created
var ShoppingCartItem = require('./models/shoppingCartItem');
var uuidv1 = require('uuid/v1');

module.exports = function (app) {

    // server routes ===========================================================
    // handle things like api calls
    app.post('/api/shopping_cart_item', function (req, res) {
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
            (err, numAffected) => {
                if (err) {
                    console.log('An error occurred:' + JSON.stringify(err));
                    res.sendStatus(400);
                } else {
                    console.log(`${JSON.stringify(numAffected)} record updated`);
                    res.sendStatus(200);
                }
            }
        );
    });

    // route to handle creating goes here (app.post)
    // route to handle delete goes here (app.delete)
}
