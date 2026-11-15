/**
 * Daeroom Cloud - Zero-dependency client helper
 * Target: pest-control-rs (db_pest_control_rs & pest-control-rs-assets)
 * Runs on Localhost & Vercel without tunnel.
 */

const DAEROOM_URL =
  process.env.DAEROOM_URL || "https://apiv1.daeroom.my.id";
const DAEROOM_API_KEY =
  process.env.DAEROOM_API_KEY || "";
const DAEROOM_READONLY_KEY =
  process.env.DAEROOM_READONLY_KEY || "";
const S3_BASE_URL =
  process.env.NEXT_PUBLIC_S3_URL || "https://s3.daeroom.my.id";
const S3_BUCKET =
  process.env.DAEROOM_S3_BUCKET || "pest-control-rs-assets";

export interface QueryResult<T = Record<string, unknown>> {
  success: boolean;
  project?: string;
  columns?: string[];
  rows?: T[];
  rowCount?: number;
  executionTimeMs?: number;
  lastCommand?: string;
  error?: string;
}

export interface StorageUploadResult {
  success: boolean;
  project?: string;
  bucket?: string;
  name?: string;
  size?: number;
  url?: string;
  error?: string;
}

export interface PresignedUrlResult {
  success: boolean;
  project?: string;
  bucket?: string;
  objectName?: string;
  uploadUrl?: string;
  publicUrl?: string;
  expiresInSeconds?: number;
  error?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  access_token?: string;
  error?: string;
}

/**
 * Execute parameterized SQL query against Daeroom Cloud PostgreSQL
 */
export async function queryDb<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
  options?: { readOnly?: boolean }
): Promise<QueryResult<T>> {
  const token = options?.readOnly
    ? DAEROOM_READONLY_KEY || DAEROOM_API_KEY
    : DAEROOM_API_KEY;

  if (!token) {
    return {
      success: false,
      error: "Missing DAEROOM_API_KEY environment variable.",
    };
  }

  try {
    const res = await fetch(`${DAEROOM_URL}/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sql, params }),
      cache: "no-store",
    });

    const data = (await res.json()) as QueryResult<T>;
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Network error connecting to Daeroom Cloud: ${message}`,
    };
  }
}

/**
 * Daeroom S3 Object Storage Helper
 */
export const daeroomStorage = {
  /**
   * Upload file or Blob directly to Daeroom S3
   */
  async upload(
    file: File | Blob,
    customPath?: string
  ): Promise<StorageUploadResult> {
    if (!DAEROOM_API_KEY) {
      return {
        success: false,
        error: "Missing DAEROOM_API_KEY environment variable.",
      };
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (customPath) {
        formData.append("path", customPath);
      }

      const res = await fetch(`${DAEROOM_URL}/v1/storage/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DAEROOM_API_KEY}`,
        },
        body: formData,
      });

      return (await res.json()) as StorageUploadResult;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Storage upload failed: ${message}`,
      };
    }
  },

  /**
   * Generate presigned URL for direct client-side PUT
   */
  async createPresignedUrl(fileName: string): Promise<PresignedUrlResult> {
    if (!DAEROOM_API_KEY) {
      return {
        success: false,
        error: "Missing DAEROOM_API_KEY environment variable.",
      };
    }

    try {
      const res = await fetch(`${DAEROOM_URL}/v1/storage/presigned`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DAEROOM_API_KEY}`,
        },
        body: JSON.stringify({ fileName }),
      });

      return (await res.json()) as PresignedUrlResult;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Presigned URL generation failed: ${message}`,
      };
    }
  },

  /**
   * Construct public URL for an asset in this bucket
   */
  getPublicUrl(name: string): string {
    const cleanName = name.replace(/^\/+/, "");
    return `${S3_BASE_URL}/${S3_BUCKET}/${cleanName}`;
  },
};

/**
 * Daeroom Managed Auth-as-a-Service Helper
 */
export const daeroomAuth = {
  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    full_name?: string
  ): Promise<AuthResponse> {
    if (!DAEROOM_API_KEY) {
      return {
        success: false,
        error: "Missing DAEROOM_API_KEY environment variable.",
      };
    }

    try {
      const res = await fetch(`${DAEROOM_URL}/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DAEROOM_API_KEY}`,
        },
        body: JSON.stringify({ email, password, full_name }),
      });

      return (await res.json()) as AuthResponse;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Registration request failed: ${message}`,
      };
    }
  },

  /**
   * Login user with email & password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    if (!DAEROOM_API_KEY) {
      return {
        success: false,
        error: "Missing DAEROOM_API_KEY environment variable.",
      };
    }

    try {
      const res = await fetch(`${DAEROOM_URL}/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DAEROOM_API_KEY}`,
        },
        body: JSON.stringify({ email, password }),
      });

      return (await res.json()) as AuthResponse;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Login request failed: ${message}`,
      };
    }
  },

  /**
   * Get user session data from userToken
   */
  async getUser(userToken: string): Promise<AuthResponse> {
    if (!DAEROOM_API_KEY) {
      return {
        success: false,
        error: "Missing DAEROOM_API_KEY environment variable.",
      };
    }

    try {
      const res = await fetch(`${DAEROOM_URL}/v1/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${DAEROOM_API_KEY}`,
          "x-user-token": userToken,
        },
      });

      return (await res.json()) as AuthResponse;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Get user request failed: ${message}`,
      };
    }
  },
};
