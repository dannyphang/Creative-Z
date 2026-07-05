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
  password?: string; // Optional access password
  isPasswordProtected: boolean; // flag for client to know
  title?: string;
  qrCustomization?: QRCustomization;
  clicksCount: number;
  clicks: ClickRecord[];
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
