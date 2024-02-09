import { default } from "./test.js";
import { vu, duration } from "./variables.js";

export const options = {
  duration: duration,
  vus: vu,
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(95)<500"], // 95 percent of response times must be below 500ms
  },
};

export function testCenario() {
  default();
}
