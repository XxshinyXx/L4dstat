import { NetworkData } from "../shared/schema";

export interface IStorage {
  addNetworkData(data: NetworkData): Promise<void>;
  getRecentNetworkData(minutes?: number): Promise<NetworkData[]>;
  clearOldData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private networkData: NetworkData[] = [];
  private readonly maxDataPoints = 1000; // Keep last 1000 data points

  async addNetworkData(data: NetworkData): Promise<void> {
    this.networkData.push(data);
    
    // Keep only the most recent data points
    if (this.networkData.length > this.maxDataPoints) {
      this.networkData = this.networkData.slice(-this.maxDataPoints);
    }
  }

  async getRecentNetworkData(minutes: number = 10): Promise<NetworkData[]> {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    return this.networkData.filter(data => data.timestamp >= cutoffTime);
  }

  async clearOldData(): Promise<void> {
    const cutoffTime = Date.now() - (60 * 60 * 1000); // Keep last hour
    this.networkData = this.networkData.filter(data => data.timestamp >= cutoffTime);
  }
}

export const storage = new MemStorage();