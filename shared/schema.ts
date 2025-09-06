import { z } from "zod";

export interface NetworkData {
  timestamp: number;
  rx_sec: number; // bytes received per second
  tx_sec: number; // bytes transmitted per second
  rx_bytes: number; // total bytes received
  tx_bytes: number; // total bytes transmitted
}

export const networkDataSchema = z.object({
  timestamp: z.number(),
  rx_sec: z.number(),
  tx_sec: z.number(),
  rx_bytes: z.number(),
  tx_bytes: z.number(),
});

export type NetworkDataType = z.infer<typeof networkDataSchema>;

export interface NetworkStats {
  interface: string;
  bandwidth: number; // in GB/s
  timestamp: number;
  rx_rate: number; // download rate in GB/s
  tx_rate: number; // upload rate in GB/s
}

export const networkStatsSchema = z.object({
  interface: z.string(),
  bandwidth: z.number(),
  timestamp: z.number(),
  rx_rate: z.number(),
  tx_rate: z.number(),
});

export type NetworkStatsType = z.infer<typeof networkStatsSchema>;