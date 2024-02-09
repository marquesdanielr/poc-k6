import http from "k6/http";
import { sleep } from "k6";

export function Checkout_Login() {
  const res = http.get("https://test.k6.io");
  sleep(1);
}
