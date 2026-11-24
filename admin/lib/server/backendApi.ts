import "server-only";

import axios from "axios";

import { env } from "@/lib/env";

export const backendApi = axios.create({
  baseURL: `${env.apiUrl}/api`,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
