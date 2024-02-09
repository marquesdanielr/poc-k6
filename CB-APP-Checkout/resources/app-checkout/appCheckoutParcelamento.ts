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

//Variável precisa ser inicializada aqui para ser exportada
var valorTotal = null;
var idParcelamento = null;

const urlMobileHttpx = new Httpx({
  baseURL: `https://mobile-b2c.casasbahia.com.br`,
  headers: headers_default
});

export function Checkout_Parcelamento() {
  group(`Step ${store}_APP_Checkout_Parcelamento (Agregado)`, () => {
    
    urlMobileHttpx.addHeader("Authorization", `Bearer ${accessToken}`);

    //APP_Checkout_Parcelamento - /checkout/pagamento/opcoes
    let res = urlMobileHttpx.get(
      "/checkout/pagamento/opcoes?cdcNovaEstrategia=true"
    );

    //APP_Checkout_Parcelamento - /checkout/cartao/tokenizados
    res = urlMobileHttpx.get("/checkout/cartao/tokenizados");

    //APP_Checkout_Parcelamento - /carrinho
    res = urlMobileHttpx.get(
      "/carrinho?ofertarServicos=true&OfertarGarantia=false&PontosFidelidade=false"
    );

    valorTotal = JSON.parse(res.body).valorTotal;

    //APP_Checkout_Parcelamento - /parcelamento/naoseguro/bin/v2/cartao
    let body_parcelamento = {
      cartoes: [
        {
          numeroCartao: "4111111111111111",
          valorCartao: valorTotal,
          posicaoCartao: 1,
        },
      ],
    };

    res = urlMobileHttpx.post(
      "/parcelamento/naoseguro/bin/v2/cartao",
      JSON.stringify(body_parcelamento)
    );

    idParcelamento = JSON.parse(res.body)[0].opcoesParcelamento[0]
      .idParcelamento;
  });

  sleep(randomIntBetween(1, 2));
}

export { valorTotal, idParcelamento };
