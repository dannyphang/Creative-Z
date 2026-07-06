export interface ClickRecord {
  timestamp: string;
  referrer: string;
  browser: string;
  device: string;
  ip?: string;
}

export interface QRCustomization {
  bgColor: string;
  fgColor: string;
  size: string;
  format: "png" | "jpeg";
}

export interface ShortenedLink {
  code: string;
  longUrl: string;
  createdAt: string;
  expiresAt?: string;
  password?: string; // Hashed password
  isPasswordProtected?: boolean; // Convenience flag for frontend
  title?: string;
  qrCustomization?: QRCustomization;
  clicksCount: number;
  clicks?: ClickRecord[];
  environment?: number; // 1 = production, 2 = local
  statusId?: number; // 1 = active, 2 = deleted
}

export interface ShortenRequest {
  longUrl: string;
  customCode?: string;
  expiresInHours?: number; // expiry offset helper
  expiresAt?: string; // specific date
  password?: string;
  title?: string;
}

export interface ShortenResponse {
  success: boolean;
  code: string;
  shortUrl: string;
  link: ShortenedLink;
  error?: string;
}
