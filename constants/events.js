require('dotenv').config();

const REDIS_CONFIG = Object.freeze({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const SERVER_EVENTS = Object.freeze({
  // connect to socket
  CONNECTION: "connection",

  // listen for approve entry with payment verified by a company
  LISTEN_POOL: "listenPool",

  // listen to pool for admin
  LISTEN_POOL_ADMIN: "listenPoolAdmin",

  // listen to pool for admin
  LISTEN_POOL_UPDATE_ADMIN: "listenPoolUpdateAdmin",

  // when payment has been approved for an order
  NEW_ENTRY: "newEntry",

  // new orders ADMIN
  NEW_ENTRY_ADMIN: "newEntryAdmin",

  // When a company has accepted the order
  ENTRY_ACCEPTED: "entryAccepted",

  // When an order is assgned to a rider
  ASSIGN_ENTRY: "assignEntry",

  // When an order as been accepted by a rider.
  // we dispatch this to the app to hide that order
  TAKEN_ENTRY: "takenEntry",

  "UPDATE_ENTRY_ADMIN": "updateEntryAdmin"
});

const CLIENT_EVENTS = Object.freeze({
  // get pool details
  CONNECT: "connect",

  // fired from the client to get chat history
  LISTEN_POOL_ADMIN_HISTORY: "listenPoolAdminHistory",

  // fired from the client to get chat history
  LISTEN_POOL_HISTORY: "listenPoolHistory",
});

module.exports = {
  SERVER_EVENTS,
  CLIENT_EVENTS,
  REDIS_CONFIG,
};