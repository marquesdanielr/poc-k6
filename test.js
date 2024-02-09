import http from "k6/http";
import { sleep } from "k6";

export function teste() {
  const res = http.get("https://test.k6.io");
  sleep(1);
}
