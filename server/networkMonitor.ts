import si from "systeminformation";
import { storage } from "./storage";
import { NetworkData } from "@shared/schema";

export class NetworkMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private previousStats: any = null;

  start(intervalMs: number = 1000) {
    this.intervalId = setInterval(async () => {
      try {
        await this.collectNetworkData();
      } catch (error) {
        console.error("Error collecting network data:", error);
      }
    }, intervalMs);
    
    console.log(`Network monitoring started with ${intervalMs}ms interval`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Network monitoring stopped");
    }
  }

  private async collectNetworkData() {
    const networkStats = await si.networkStats();
    const timestamp = Date.now();

    if (networkStats && networkStats.length > 0) {
      const primaryInterface = networkStats[0];
      
      const networkData: NetworkData = {
        timestamp,
        rx_sec: primaryInterface.rx_sec || 0,
        tx_sec: primaryInterface.tx_sec || 0,
        rx_bytes: primaryInterface.rx_bytes || 0,
        tx_bytes: primaryInterface.tx_bytes || 0,
      };

      await storage.addNetworkData(networkData);
      
      // Clean up old data periodically (every 5 minutes)
      if (timestamp % (5 * 60 * 1000) < 1000) {
        await storage.clearOldData();
      }
    }
  }
}

export const networkMonitor = new NetworkMonitor();