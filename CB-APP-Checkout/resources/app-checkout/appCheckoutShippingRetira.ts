import { group, sleep } from "k6";
// Httpx is a wrapper for the underlying http module in 'k6/http' (set global headers, timeouts, baseURL)
import { Httpx } from "https://jslib.k6.io/httpx/0.0.6/index.js";

import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

import { verifyResponse } from "../../common/utils.ts";

import {
  store,
  headers_default,
} from "../../userVariables.ts";

import {
  accessToken,
  cpfUsuario,
  idUsuario,
  randomSku,
} from "./appCheckoutLogin.ts";

import { idClienteEndereco } from "./appCheckoutSelecaoEndereco.ts";

import { randomSkuRetira } from "./appCheckoutAddToCartRetira.ts";

const urlMobileHttpx = new Httpx({
  baseURL: `https://mobile-b2c.casasbahia.com.br`,
  headers: headers_default
});

export function Checkout_Shipping_Retira(randomUsers) {
  group(`Step ${store}_APP_Checkout_Shipping (Agregado)`, () => {
    
    //APP_Checkout_Shipping - /carrinho
    urlMobileHttpx.addHeader("Authorization", `Bearer ${accessToken}`);
    let res = urlMobileHttpx.get(
      "/carrinho?ofertarservicos=true&ofertargarantia=false&pontosfidelidade=false"
    );

    //APP_Checkout_Shipping - /checkout/valecompra/valor

    let valor_body = {
      'cpfCnpj': `${cpfUsuario}`,
    };

    res = urlMobileHttpx.post(
      "/checkout/valecompra/valor",
      JSON.stringify(valor_body)
    );

    //APP_Checkout_Shipping - /carrinho/produtos/quantidade

    res = urlMobileHttpx.get("/carrinho/produtos/quantidade");

    //APP_Checkout_Shipping - /coleta/salesforce/carrinho

    let body_carrinho = {
      'IdUnico': `${idUsuario}`,
      'Chave': `${idUsuario}`,
      'Origem': "PDP",
      'PrecoSite': 1000.0,
      'PrecoDesconto': 0.0,
      'Sku': randomSkuRetira.IdSku_Retira,
      'QuantidadeItens': 1,
    };

    res = urlMobileHttpx.post(
      "/coleta/salesforce/carrinho",
      JSON.stringify(body_carrinho)
    );

    //APP_Checkout_Shipping - /coleta/evento/carrinho
    let body_evento_carrinho = {
      'user': {
        'email': randomUsers.email,
      },
      produtos: [
        {
          'pid': "${produtoid}", //TODO Conferir, pois no script normal não está parametrizado também.
          'sku': "${skuid}",
          'preco': 1000,
          'quantidade': 1,
        },
      ],
    };

    res = urlMobileHttpx.post(
      "/coleta/evento/carrinho",
      JSON.stringify(body_evento_carrinho)
    );

    //APP_Checkout_Shipping - /entregas
    let body_entregas = {
      'idClienteEndereco': randomSkuRetira.IdClienteEnderecoSelecionado_Retira,
      'idFormaEntrega': 12,
      'idLojaFisica': randomSkuRetira.IdEnderecoLoja_Retira,
    };
    res = urlMobileHttpx.post("/entregas", JSON.stringify(body_entregas));

  });

  sleep(randomIntBetween(1, 2));
}
