import { group, sleep } from "k6";
// Httpx is a wrapper for the underlying http module in 'k6/http' (set global headers, timeouts, baseURL)
import { Httpx } from "https://jslib.k6.io/httpx/0.0.6/index.js";

import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

import { verifyResponse } from "../../common/utils.ts";

import {
  store,
  headers_default,
} from "../../userVariables.ts";

import { accessToken, idUsuario, randomUsers } from "./appCheckoutLogin.ts";

// Papaparse for CSV parsing (https://www.papaparse.com/)
import papaparse from "https://jslib.k6.io/papaparse/5.1.1/index.js";
// SharedArray provides a more memory-efficient way of dealing with potentially large CSV files
import { SharedArray } from "k6/data";

import { randomItem } from "https://jslib.k6.io/k6-utils/1.3.0/index.js";

const skuRetira = new SharedArray("skuRetira", function () {
  return papaparse.parse(open("../../data/appCheckout/retiraappcb.csv"), {
    header: true,
  }).data;
});

var randomSkuRetira = null

const urlMobileHttpx = new Httpx({
  baseURL: `https://mobile-b2c.casasbahia.com.br`,
  headers: headers_default
});

export function Checkout_Add_To_Cart_Retira(randomUsers) {
  group(`Step ${store}_APP_Checkout_Add_To_Cart (Agregado)`, () => {
    var randomSkuRetira = randomItem(skuRetira);
    
    urlMobileHttpx.addHeader("Authorization", `Bearer ${accessToken}`);

    // APP_Checkout_Add_To_Cart - /carrinho/produto
    let produto_body = {
      sku: randomSkuRetira.IdSku_Retira, 
      idLojista: randomSkuRetira.idLojista,
      idEnderecoLojaFisica: randomSkuRetira.idEnderecoLojaRetirada_Retira,
    };
    let res = urlMobileHttpx.post(
      "/carrinho/produto",
      JSON.stringify(produto_body)
    );

    // APP_Checkout_Add_To_Cart - /carrinho?ofertarservicos=true&ofertargarantia=false&pontosfidelidade=false

    res = urlMobileHttpx.get(
      "/carrinho?ofertarservicos=true&ofertargarantia=false&pontosfidelidade=false"
    );

    var idCarrinhoSku = JSON.parse(res.body).skus[0].idCarrinhoSku;
    var valorTotal = JSON.parse(res.body).valorTotal;

    // APP_Checkout_Add_To_Cart - /carrinho/produto/garantiaestendida

    res = urlMobileHttpx.get(
      `/carrinho/produto/garantiaestendida?idcarrinhosku=${idCarrinhoSku}`,
      null,
      {
        tags: { name: "/carrinho/produto/garantiaestendida?idcarrinhosku=${idCarrinhoSku}"}
      }
    );

    // APP_Checkout_Add_To_Cart - /carrinho/produto/fiqueSeguro

    res = urlMobileHttpx.get(
      `/carrinho/produto/fiqueSeguro?idCarrinhoSku=${idCarrinhoSku}`,
      null,
      {
        tags: { name: "/carrinho/produto/fiqueSeguro?idCarrinhoSku=${idCarrinhoSku}"}
      }
    );

    // APP_Checkout_Add_To_Cart - /carrinho/produtos/quantidade

    res = urlMobileHttpx.get("/carrinho/produtos/quantidade");

    // APP_Checkout_Add_To_Cart - /carrinho/salesforce/carrinho

    let body_salesforce_carrinho = {
      IdUnico: `${idUsuario}`,
      Chave: `${idUsuario}`,
      Origem: "PDP",
      PrecoSite: 1000.0,
      PrecoDesconto: 0.0,
      Sku: "${sku}",
      QuantidadeItens: 1,
    };

    res = urlMobileHttpx.post(
      "/coleta/salesforce/carrinho",
      JSON.stringify(body_salesforce_carrinho)
    );

    // APP_Checkout_Add_To_Cart - /coleta/evento/carrinho

    let body_carrinho = {
      user: {
        email: randomUsers.email,
      },
      produtos: [
        {
          pid: "${produtoid}", 
          sku: "${skuid}",
          preco: 1000,
          quantidade: 1,
        },
      ],
    };

    res = urlMobileHttpx.post(
      "/coleta/evento/carrinho",
      JSON.stringify(body_carrinho)
    );
  });

  sleep(randomIntBetween(1, 2));
}

export { randomSkuRetira };
