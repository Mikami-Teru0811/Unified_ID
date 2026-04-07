import dotenv from "dotenv";
import app from "./src/app.js";
import { initSocketIO } from "./src/config/socket.js";
import { connectRedis } from "./src/config/redis.js";
import connectDB from "./src/config/db.js";
import seedPermissions from "./src/config/seedPermissions.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    await seedPermissions();
    
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    initSocketIO(server);
    console.log('Socket.IO initialized');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
