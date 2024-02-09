import { appCheckoutB2C, appCheckoutMktp, appCheckoutRetira } from "./scenarios/appCheckout.scenarios.ts";
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';
import { duration_st, vus_st } from "./execVariables.ts"

export const options = {
  scenarios: {
    appCheckoutSmoketest: {
      executor: "ramping-vus",
      startvus: vus_st,
      stages: [
        { duration: duration_st, target: vus_st }
      ],
      exec: "appCheckoutScenario",
    }
  },
  ext: {
    loadimpact: {
      distribution: {
        distributionLabel: { loadZone: 'amazon:br:sao paulo', percent: 100 },
      },
      drop_metrics: [
        "http_req_blocked",
        "http_req_connecting",
        "http_req_receiving",
        "http_req_sending",
        "http_req_tls_handshaking",
        "http_req_waiting"
      ],
      drop_tags: {
        "http_req_duration": ["instance_id"],
        "http_reqs": ["instance_id"],
        "http_req_failed": ["instance_id"],
        "checks": ["instance_id"]
      }
    },
  },
};

export function appCheckoutScenario() {
  appCheckoutB2C();
}