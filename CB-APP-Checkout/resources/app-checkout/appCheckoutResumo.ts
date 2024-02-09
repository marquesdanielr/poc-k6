import { group, sleep } from "k6";
// Httpx is a wrapper for the underlying http module in 'k6/http' (set global headers, timeouts, baseURL)
import { Httpx } from "https://jslib.k6.io/httpx/0.0.6/index.js";

import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

import { verifyResponse } from "../../common/utils.ts";

import {
  headers_default,
  store,
} from "../../userVariables.ts";

import { numPedido } from "./appCheckoutFinalizarCompra.ts";

import { accessToken } from "./appCheckoutLogin.ts";

const urlMobileHttpx = new Httpx({
  baseURL: `https://mobile-b2c.casasbahia.com.br`,
  headers: headers_default
});

export function Checkout_Resumo() {
  group(`Step ${store}_APP_Checkout_Resumo(Agregado)`, () => {
    if (numPedido != null && numPedido != "0") {
      urlMobileHttpx.addHeader("Authorization", `Bearer ${accessToken}`);

      let res = urlMobileHttpx.get(`/meuspedidos/resumo?idPedido=${numPedido}`, null, {
        tags: { name: "/meuspedidos/resumo?idPedido=${numPedido}" }
      });
    };
  });

  sleep(randomIntBetween(1, 2));
}
