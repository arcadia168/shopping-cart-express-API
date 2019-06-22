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
describe('Routes', () => {
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
        await mongoose.connect(mongoUri, (err) => {
            if (err) console.error(err);
        });
        routes(app);
    });

    afterAll(async () => {
        mongoose.disconnect();
        await mongoServer.stop();
    });

    it('Exposes an endopint to save shopping cart items', async () => {
        const response = await request(app)
            .post('/api/shopping_cart_item')
            .send({
                title: 'iPhone XS',
                price: 999.99
            });

        // expect(response.status).toBe(200)

        // Assert that the item was inserted into the databse
       const expectedInsertedItem = await ShoppingCartItem.find({
           title: 'iPhone XS'
       });

       expect(expectedInsertedItem[0].title).toBe('iPhone XS')
    });
});
