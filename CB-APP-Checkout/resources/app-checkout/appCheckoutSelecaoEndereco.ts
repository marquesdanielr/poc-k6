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

//Variável deve ser inicializada aqui para ser exportada.
var deveExcluirEndereco = false;
var idClienteEnderecoCad = 0;
var idClienteEndereco = null;

const urlMobileHttpx = new Httpx({
  baseURL: `https://mobile-b2c.casasbahia.com.br`,
  headers: headers_default
});

export function Checkout_Selecao_Endereco() {
  group(`Step ${store}_APP_Checkout_Selecao_Endereco (Agregado)`, () => {
    //APP_Checkout_Selecao_Endereco - /enderecos/naoseguro
    urlMobileHttpx.addHeader("Authorization", `Bearer ${accessToken}`);

    let naoseguro_body = {
      nome: "Teste stress 1234",
      tipoEndereco: "Residencial",
      destinatario: "Stress test",
      rua: "Rua Teste stress",
      numero: "93",
      cep: "09510-125",
      complemento: "string",
      bairro: "Centro",
      municipio: "São Caetano do Sul",
      estado: "SP",
      pontoReferencia: "Via Varejo",
    };
    let res = urlMobileHttpx.post(
      "/enderecos",
      JSON.stringify(naoseguro_body)
    );

    idClienteEnderecoCad = JSON.parse(res.body);
    if (idClienteEnderecoCad > 0) {
      deveExcluirEndereco = true;
    }

    //APP_Checkout_Selecao_Endereco - /enderecos
    res = urlMobileHttpx.get("/enderecos");

    idClienteEndereco = JSON.parse(res.body)[0].idClienteEndereco;

    //APP_Checkout_Selecao_Endereco - /entregas/formasEntrega
    // res = urlMobileHttpx.get(
    //   `/entregas/formasEntrega?idclienteendereco=${idClienteEndereco}`
    // );

  });

  sleep(randomIntBetween(1, 2));
}

export { idClienteEndereco, deveExcluirEndereco, idClienteEnderecoCad };
