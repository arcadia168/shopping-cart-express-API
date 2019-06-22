# Node Express and MongoDB Shopping Cart API

This is a startup project with a basic Node Express server for a shopping cart.

Query the live API deployed to and running on the Google Cloud Platform [here](https://shopping-basket-express-api.appspot.com)

To use:
- `npm install`
- `npm run start`

To test:
- `npm run test` (or just `jest` if you have it installed globally)
- I have also included a list of exported Postman requests that I have been using to test both the local and live versions of the API [here](./__tests__/shopping_cart_api.postman_collection.json)

Watchers:
- `npm run test:watch`

To deploy to Google Cloud:
- `npm run deploy` (setup a new project first). 

## Development Notes

### Architectural Decisions
- This is a simple Node.js Express framework REST API server running on Google Cloud Platform.
- It makes use of a live test MongoDB running on the free experimental tier of MongoLab. The credentials are in this repo, but this is fine as it is just a test user
- All the routes are in one file because they are only small, about 125 lines, otherwise I would split them out.
- Makes use of the ODM Mongoose for interfacing with the MongoDB on MongoLab
- Used server side sessions to identify 'baskets' of items so that each user in a given browser can only a single persisted basket
- As a result of using sessions, this API supports multiple users each with their own basket, and is scalable.

### Automated Testing
- Written using TDD via Jest, the execellent [`mongodb-memory-server`](https://github.com/nodkz/mongodb-memory-server) and supertest.
- Followed the 'red, greeen, refactor' method of writing a failing test, making it pass, commiting this and then making small imrprovements to code layout, ensuring tests all still passed.
- The 'in memory' database means that no test data is persisted and the tests are fully portable. The API to this works with the Mongoose ODM so was super easy to setup.

### Portability and Setup
- Just pull the repo, run `npm install` and `npm start` - this installs dependencies and starts the Express Node server running on the port `8080`
- This code is also easily deployable to cloud services as they mostly use `server.js` and that is setup in `package.json` via `nodemon`. Shold be easily deployable to also Azure and AWS, currently runs on GCP.

### Documentation
- There are few comments but I hope the tests act as 'specifications' and that this README alongside the 'self documenting' nature of the code will suffice.

### Real world deployment and scalability
- Already running on a real cloud (Google Cloud) and talking to a real MongoDB.
- MongoDB would need to be changes from a non-sharded, non-data redundant free tier to a scalable paid production tier in MongoLab - just add cash.
- GCP also would also just need upgrading from the free tier to a production, scalable tier via adding some cash!
- Deployment to these services tends to be easily command line drive via the `gcloud` cli or `aws` cli. I also like Bamboo or Jenkins.
