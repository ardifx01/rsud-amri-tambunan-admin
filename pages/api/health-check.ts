// pages/api/health-check.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  res.status(200).json({
    status: 'Oke',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}