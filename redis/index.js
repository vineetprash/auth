import { createClient } from "redis";
// const redisClient = createClient();
const redisClient = null;

// redisClient.on("error", (err) => console.error("Redis Client Error", err));

// (async () => {
//   await redisClient.connect();
//   console.log("Connected to Redis");
// })();

export default redisClient;
