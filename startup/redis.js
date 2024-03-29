const redis = require("ioredis");
const { REDIS_CONFIG } = require("../constants/events");

const redisClient = redis.createClient(process.env.REDIS_URL);

redisClient.on("error", (error) => {
    console.error("Redis error:", error);
});

// Listen for the connect event
redisClient.on("connect", function () {
    console.log("Redis client connected");
});

module.exports = {
    redisClient,
};