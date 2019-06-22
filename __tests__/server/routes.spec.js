var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session')
var methodOverride = require('method-override');
var mongoose = require('mongoose');
const uuidv1 = require('uuid/v1');
var db = require('../../config/db');
var routes = require('../../src/server/routes');

// Test utils
var mongodb = require('mongo-mock');
var request = require('supertest');

let app;
describe('Routes', () => {
    beforeAll(() => {
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
        mongoose.connect(db.url, { useMongoClient: true });
        routes(app);
    });

    it('Exposes an endopint to return categories', done => {
        request(app).get('/').then(
            response => {
                expect(response).toBe(null);
                done();
            }
        ).catch(error => {
            expect(error).toBe(null)
        });
    });
});
