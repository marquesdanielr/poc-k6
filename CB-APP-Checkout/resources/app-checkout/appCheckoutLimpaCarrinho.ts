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

export function Checkout_Limpa_Carrinho() {
  group(`Step ${store}_APP_Checkout_Limpa_Carrinho (Agregado)`, () => {
    
    urlMobileHttpx.addHeader("Authorization", `Bearer ${accessToken}`);

    // APP_Checkout_Limpa_Carrinho - /carrinho/produtos
    let res = urlMobileHttpx.delete("/carrinho/produtos");

    // APP_Checkout_Limpa_Carrinho - /carrinho/produtos
    res = urlMobileHttpx.delete("/carrinho/produtos/");

    // APP_Checkout_Limpa_Carrinho - /carrinho?ofertarservicos=true&ofertargarantia=false&pontosfidelidade=false
    res = urlMobileHttpx.get(
      "/carrinho?ofertarservicos=true&ofertargarantia=false&pontosfidelidade=false"
    );

    // APP_Checkout_Limpa_Carrinho - /carrinho/produtos/quantidade
    res = urlMobileHttpx.get("/carrinho/produtos/quantidade");

  });

  sleep(randomIntBetween(1, 2));
}
