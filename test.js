import http from "k6/http";
import { sleep } from "k6";

import { vu, duration } from "./variables.js";

export const options = {
  duration: duration,
  vus: vu,
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(95)<500"], // 95 percent of response times must be below 500ms
  },
};

export function teste() {
  const res = http.get("https://test.k6.io");
  sleep(1);
}
