import { RectangleStoreType } from "./ZodSchema";
import Redis from "ioredis";

// Create a Redis instance.
// By default, it will connect to localhost:6379.
// We are going to cover how to specify connection options soon.
const redis = new Redis({
  // your connection config here
});
console.log("REDIS_URL", process.env.REDIS_URL);
console.log("REDISHOST", process.env.REDISHOST);
console.log("REDISPASSWORD", process.env.REDISPASSWORD);
console.log("REDISPORT", process.env.REDISPORT);
console.log("REDISUSER", process.env.REDISUSER);
// Add error handlers
redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redis.on("connect", () => {
  console.log("Successfully connected to Redis");
});

redis.on("reconnecting", () => {
  console.log("Reconnecting to Redis...");
});

// console.log("redis", redis);
redis.set("mykey", "value"); // Returns a promise which resolves to "OK" when the command succeeds.

// ioredis supports the node.js callback style
redis.get("mykey", (err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.log(result); // Prints "value"
  }
});
console.log("done");

export const setLine = async (
  roomId: string,
  socketId: string,
  lineId: string,
  data: RectangleStoreType[number]
) => {
  redis.set(`${roomId}:${socketId}:${lineId}`, JSON.stringify(data));
};

export const getLines = async (roomId: string, socketId: string) => {
  return redis.keys(`${roomId}:${socketId}:*`).then(async (keys) => {
    const lines = await Promise.all(keys.map((key) => redis.get(key)));
    return lines
      .map((line) => JSON.parse(line || "null"))
      .filter((line) => line !== null);
  });
};

export const getLastLine = async (
  roomId: string,
  socketId: string
): Promise<[RectangleStoreType[number], number]> => {
  // Get all keys for the room and socket
  const keys = await redis.keys(`${roomId}:${socketId}:*`);
  if (keys.length === 0) throw new Error("No lines found");

  // Extract line IDs and find the maximum
  const lineIds = keys.map((key) => {
    const parts = key.split(":");
    return parseInt(parts[2]);
  });

  const maxLineId = Math.max(...lineIds);

  // Get the line with the highest ID
  const lastLine = await redis.get(`${roomId}:${socketId}:${maxLineId}`);
  if (!lastLine) throw new Error("No last line found");
  return [JSON.parse(lastLine), maxLineId];
};
