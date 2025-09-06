import { Router } from "express";
import { storage } from "./storage";
import { networkDataSchema } from "@shared/schema";
import si from "systeminformation";

const router = Router();

// Get recent network data
router.get("/api/network/recent", async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes as string) || 10;
    const data = await storage.getRecentNetworkData(minutes);
    res.json(data);
  } catch (error) {
    console.error("Error fetching network data:", error);
    res.status(500).json({ error: "Failed to fetch network data" });
  }
});

// Get current network stats
router.get("/api/network/current", async (req, res) => {
  try {
    const networkStats = await si.networkStats();
    const timestamp = Date.now();
    
    if (networkStats && networkStats.length > 0) {
      const primaryInterface = networkStats[0];
      
      // Convert bytes per second to GB/s
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

export default router;