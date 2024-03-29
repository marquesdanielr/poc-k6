import { appCheckoutB2C, appCheckoutMktp, appCheckoutRetira } from "./scenarios/appCheckout.scenarios.ts";
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';

export const options = {
  scenarios: {
    appCheckoutValidacao: {
    executor: "per-vu-iterations",
      vus: 1,
      iterations: 1,
	  maxduration: '100s',
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

export function appCheckoutScenario(){
  if (randomIntBetween(1, 100) <= 30) {
    appCheckoutMktp();
  }

  appCheckoutB2C();

  if (randomIntBetween(1, 100) <= 20) {
    appCheckoutRetira();
  }
  
}