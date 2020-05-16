const {
  ApolloServer,
  // ApolloError,
  ValidationError,
} = require("apollo-server-express");
const express = require("express");
const session = require("express-session");
const connectRedis = require("connect-redis");
const db = require("./data/knexConf");
const app = express();
const redis = require("./redis.js");
const cors = require("cors");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

require("dotenv").config();

const port = process.env.PORT;

const RedisStore = connectRedis(session);

let sessionOptions = {
  store: new RedisStore({
    client: redis,
  }),
  name: "qid",
  secret: String(process.env.SECRET),
  resave: false,
  saveUninitialized: false,
  cookie: {
    // maxAge: 10000,
  },
};

if (process.env.SECURE === "yes") {
  app.set("trust proxy", 1); // trust first proxy
  sessionOptions.cookie.secure = true; // serve secure cookies
  sessionOptions.cookie.maxAge = 10000;
}

// else if (process.env.SECURE === "no") {
//   app.set("trust proxy", 1); // trust first proxy
//   sessionOptions.cookie.maxAge = 10000; // serve secure cookies
// }

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
});

app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
  })
);

app.use(session(sessionOptions));

server.applyMiddleware({ app, cors: false });

app.listen(port, () => {
  console.log(`Server ready on http://localhost:${port}/graphq 🚀`);
});
