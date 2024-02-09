import { group, sleep } from "k6";
// Httpx is a wrapper for the underlying http module in 'k6/http' (set global headers, timeouts, baseURL)
import { Httpx } from "https://jslib.k6.io/httpx/0.0.6/index.js";

import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

import { verifyResponse } from "../../common/utils.ts";

import {
  store,
  headers_default,
} from "../../userVariables.ts";

import { accessToken } from "./appCheckoutLogin.ts";

const urlMobileHttpx = new Httpx({
  baseURL: `https://mobile-b2c.casasbahia.com.br`,
  headers: headers_default
});

export function Checkout_Meus_Pedidos() {
  group(`Step ${store}_APP_Checkout_Meus_Pedidos(Agregado)`, () => {

    urlMobileHttpx.addHeader("Authorization", `Bearer ${accessToken}`);

    //APP_Checkout_Meus_Pedidos - /meuspedidos/v2/lisgtagem

    let res = urlMobileHttpx.get("/meuspedidos/v2/listagem?Pagina=1");

    try {
      var pedido = JSON.parse(res.body)[0].idPedido;

      //APP_Checkout_Meus_Pedidos - /meuspedidos/detalhes

      if (pedido > 0) {
        res = urlMobileHttpx.get(`/meuspedidos/v2/detalhes?idPedido=${pedido}`, null, {
          tags: { name: "/meuspedidos/v2/detalhes?idPedido=${pedido}" }
        });
      };
    } catch (error) { }
  });

  sleep(randomIntBetween(1, 2));
}
