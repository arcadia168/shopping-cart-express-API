import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import methodOverride from 'method-override';
import uuidv1 from 'uuid/v1';
import dbconfig from '../../config/db';
import routes from '../../src/server/routes';
import ShoppingCartItem from '../../src/server/models/shoppingCartItem';

// Test utils
var request = require('supertest');

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { exportAllDeclaration } from '@babel/types';

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let mongoServer;
let app;
describe('Shopping Cart API', () => {
    beforeAll(async () => {
        app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.json({
            type: 'application/vnd.api+json'
        }));
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(methodOverride('X-HTTP-Method-Override'));
        var sess = {
            genid: function (req) {
                return uuidv1() // use UUIDs for session IDs
            },
            secret: 'keyboard cat',
            cookie: {}
        }
        app.use(session(sess));

        // connect to our mongoDB database
        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getConnectionString();
        await mongoose.connect(mongoUri, { useNewUrlParser: true }, (err) => {
            if (err) console.error(err);
        });
        routes(app);
    });

    afterAll(async () => {
        mongoose.disconnect();
        await mongoServer.stop();
    });

    it('Has an API endpoint for adding an item', async () => {
        await request(app)
            .post('/api/shopping_cart_item')
            .send({
                title: 'iPhone XS',
                price: 999.99
            });

        // Assert that the item was inserted into the databse
        const expectedInsertedItem = await ShoppingCartItem.find({
            title: 'iPhone XS'
        });

        expect(expectedInsertedItem[0].title).toBe('iPhone XS')
    });

    it('Has an API endpoint for deleting a given item', async () => {
        // Add a test item to the database
        const itemToDeleteBody = {
            id: uuidv1(),
            title: 'testitemtodelete',
            price: 100,
            basketId: 'testbasket'
        };

        const itemToDeleteId = itemToDeleteBody.id;
        const testItemToDelete = new ShoppingCartItem(itemToDeleteBody);
        // Save this test item to the database
        await testItemToDelete.save();

        const response = await request(app)
            .delete(`/api/shopping_cart_item/${itemToDeleteId}`);

        // Assert that the item was deleted from the databse
        const expectedDeletedItem = await ShoppingCartItem.find({
            id: itemToDeleteId
        });

        expect(expectedDeletedItem[0]).toBe(undefined)
    });

    it('Has an API endpoint for clearing all of the items in a given basket', async () => {
        // Add some test items to the database for this given basket/session
        const firstBasketItem = {
            id: uuidv1(),
            title: 'firstbasketitem',
            price: 98,
            basketId: 'testbasket'
        };
        const secondBasketItem = {
            id: uuidv1(),
            title: 'secondbasketitem',
            price: 99,
            basketId: 'testbasket'
        };
        const thirdBasketItem = {
            id: uuidv1(),
            title: 'thirdbasketitem',
            price: 100,
            basketId: 'testbasket'
        };

        const firstBaskedItemToSave = new ShoppingCartItem(firstBasketItem);
        await firstBaskedItemToSave.save();

        const secondBasketItemToSave = new ShoppingCartItem(secondBasketItem);
        await secondBasketItemToSave.save();

        const thirdBasketItemToSave = new ShoppingCartItem(thirdBasketItem);
        await thirdBasketItemToSave.save();

        await request(app)
            .delete(`/api/shopping_cart/testbasket`);

        // Assert that the items from this basket were deleted from the databse
        const expectedDeletedBasketItems = await ShoppingCartItem.find({
            basketId: 'testbasket'
        });

        expect(expectedDeletedBasketItems).toEqual([])
    });

    it('Has an API endpoint for listing all of the items in a given basket', async () => {
        // Add some test items to the database for this given basket/session
        const firstBasketItem = {
            id: uuidv1(),
            title: 'firstbasketlistitem',
            price: 98,
            basketId: 'testlistbasket'
        };
        const firstItemId = firstBasketItem.id;
        const secondBasketItem = {
            id: uuidv1(),
            title: 'secondbasketlistitem',
            price: 99,
            basketId: 'testlistbasket'
        };
        const secondItemId = secondBasketItem.id;
        const thirdBasketItem = {
            id: uuidv1(),
            title: 'thirdbasketlistitem',
            price: 100,
            basketId: 'testlistbasket'
        };
        const thirdItemId = thirdBasketItem.id;

        const firstBaskedItemToList = new ShoppingCartItem(firstBasketItem);
        await firstBaskedItemToList.save();

        const secondBasketItemToList = new ShoppingCartItem(secondBasketItem);
        await secondBasketItemToList.save();

        const thirdBasketItemToList = new ShoppingCartItem(thirdBasketItem);
        await thirdBasketItemToList.save();

        const response = await request(app)
            .get(`/api/shopping_cart/testlistbasket`);

        expect(response.body).toEqual(
            [
                {
                    id: firstItemId,
                    title: 'firstbasketlistitem',
                    price: 98,
                    basketId: 'testlistbasket'
                },
                {
                    id: secondItemId,
                    title: 'secondbasketlistitem',
                    price: 99,
                    basketId: 'testlistbasket'
                },
                {
                    id: thirdItemId,
                    title: 'thirdbasketlistitem',
                    price: 100,
                    basketId: 'testlistbasket'
                }
            ]
        );
    });

    it('Has an enpoint API for finding the total value of a given basket', async () => {
        // Add some test items to the database for this given basket/session
        const firstBasketItem = {
            id: uuidv1(),
            title: 'firstbasketlistitem',
            price: 10.23,
            basketId: 'testtotalpricebasket'
        };
        const secondBasketItem = {
            id: uuidv1(),
            title: 'secondbasketlistitem',
            price: 20.45,
            basketId: 'testtotalpricebasket'
        };
        const thirdBasketItem = {
            id: uuidv1(),
            title: 'thirdbasketlistitem',
            price: 100.65,
            basketId: 'testtotalpricebasket'
        };

        const firstBaskedItemToList = new ShoppingCartItem(firstBasketItem);
        await firstBaskedItemToList.save();

        const secondBasketItemToList = new ShoppingCartItem(secondBasketItem);
        await secondBasketItemToList.save();

        const thirdBasketItemToList = new ShoppingCartItem(thirdBasketItem);
        await thirdBasketItemToList.save();

        const response = await request(app)
            .get(`/api/shopping_cart/totalbasketprice/testtotalpricebasket`);

        expect(response.body.totalBasketPrice).toBe(131.33)
    });
});
