import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import path from "path";
import { storage } from "./storage";
import { networkMonitor } from "./networkMonitor";
import si from "systeminformation";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

app.use(cors());
app.use(express.json());

// API Routes
app.get("/api/network/recent", async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes as string) || 10;
    const data = await storage.getRecentNetworkData(minutes);
    res.json(data);
  } catch (error) {
    console.error("Error fetching network data:", error);
    res.status(500).json({ error: "Failed to fetch network data" });
  }
});

app.get("/api/network/current", async (req, res) => {
  try {
    const networkStats = await si.networkStats();
    const timestamp = Date.now();
    
    if (networkStats && networkStats.length > 0) {
      const primaryInterface = networkStats[0];
      const rxRate = primaryInterface.rx_sec / (1024 * 1024 * 1024);
      const txRate = primaryInterface.tx_sec / (1024 * 1024 * 1024);
      const bandwidth = rxRate + txRate;
      
      const stats = {
        interface: primaryInterface.iface,
        bandwidth,
        timestamp,
        rx_rate: rxRate,
        tx_rate: txRate
      };
      
      res.json(stats);
    } else {
      res.json({
        interface: "unknown",
        bandwidth: 0,
        timestamp,
        rx_rate: 0,
        tx_rate: 0
      });
    }
  } catch (error) {
    console.error("Error fetching current network stats:", error);
    res.status(500).json({ error: "Failed to fetch current network stats" });
  }
});

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
            const rxRate = latest.rx_sec / (1024 * 1024 * 1024);
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

const PORT = parseInt(process.env.PORT || "5000");

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start network monitoring
  networkMonitor.start(1000);
  
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