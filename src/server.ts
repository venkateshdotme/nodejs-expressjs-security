import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";

async function startServer() {
  try {
    await mongoose.connect(env.MONGO_URI);

    const server = app.listen(env.PORT, () => {
      console.log(`Server listening on port ${env.PORT}`);
    });

    async function shutdown(signal: string) {
      console.log(`Received ${signal}; shutting down`);

      server.close(async () => {
        await mongoose.disconnect();

        process.exit(0);
      });
    }

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    console.error("Server startup failed", error);

    process.exit(1);
  }
}

void startServer();
