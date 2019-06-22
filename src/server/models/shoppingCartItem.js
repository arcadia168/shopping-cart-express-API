// grab the mongoose module
var mongoose = require('mongoose');

// define our shopping cart item model
var shoppingCartItem = new mongoose.Schema({
    id: String,
    title: String,
    price: Number,
})

module.exports = mongoose.model('ShoppingCartItem', shoppingCartItem);
