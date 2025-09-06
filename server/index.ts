import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import routes from "./routes";
import { networkMonitor } from "./networkMonitor";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

app.use(cors());
app.use(express.json());
app.use(routes);

// WebSocket for real-time updates
wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket");
  
  ws.on("close", () => {
    console.log("Client disconnected from WebSocket");
  });
});

// Broadcast network data to all connected clients
const broadcastNetworkData = () => {
  if (wss.clients.size > 0) {
    wss.clients.forEach(async (client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          const data = await storage.getRecentNetworkData(1);
          if (data.length > 0) {
            const latest = data[data.length - 1];
            const rxRate = latest.rx_sec / (1024 * 1024 * 1024); // Convert to GB/s
            const txRate = latest.tx_sec / (1024 * 1024 * 1024);
            const bandwidth = rxRate + txRate;
            
            client.send(JSON.stringify({
              timestamp: latest.timestamp,
              bandwidth,
              rx_rate: rxRate,
              tx_rate: txRate
            }));
          }
        } catch (error) {
          console.error("Error broadcasting data:", error);
        }
      }
    });
  }
};

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start network monitoring
  networkMonitor.start(1000); // Collect data every second
  
  // Broadcast data every second
  setInterval(broadcastNetworkData, 1000);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  networkMonitor.stop();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});