// src/app/core/models/device.model.ts

export interface Device {
  id: number;

  // Campos que usa tu diseño del frontend
  device_id: string;
  name: string;
  device_type: string;
  firmware_version?: string;
  ip_address?: string | null;
  mac_address?: string;
  status: string;
  last_seen?: string | null;
  active: boolean;
  zone: number;
  zone_name?: string;
  farm_name?: string;
  created_at?: string;
  updated_at?: string;

  // Campos reales del backend Django
  codigo?: string;
  ubicacion?: string;
  estado?: string;
  zona?: number;
}

export interface PaginatedDeviceResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Device[];
}