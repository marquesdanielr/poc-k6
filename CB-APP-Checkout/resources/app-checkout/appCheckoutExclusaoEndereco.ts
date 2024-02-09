import { group, sleep } from "k6";
// Httpx is a wrapper for the underlying http module in 'k6/http' (set global headers, timeouts, baseURL)
import { Httpx } from "https://jslib.k6.io/httpx/0.0.6/index.js";

import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

import { verifyResponse } from "../../common/utils.ts";

import {
  store,
  headers_default,
} from "../../userVariables.ts";

import { idClienteEnderecoCad } from "./appCheckoutSelecaoEndereco.ts";

import { accessToken } from "./appCheckoutLogin.ts";

const urlMobileHttpx = new Httpx({
  baseURL: `https://mobile-b2c.casasbahia.com.br`,
  headers: headers_default
});

export function Checkout_Exclusao_Endereco() {
  group(`Step ${store}_APP_Checkout_Exclusao_Endereco(Agregado)`, () => {
    
    urlMobileHttpx.addHeader("Authorization", `Bearer ${accessToken}`);
    let body_exclusao = {
      IdClienteEndereco: idClienteEnderecoCad,
    };

    let res = urlMobileHttpx.delete(
      "/enderecos",
      JSON.stringify(body_exclusao)
    );

  });

  sleep(randomIntBetween(1, 2));
}
