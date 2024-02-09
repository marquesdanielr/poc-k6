
import { Checkout_Login } from "../resources/app-checkout/appCheckoutLogin.ts";


// Papaparse for CSV parsing (https://www.papaparse.com/)
import papaparse from "https://jslib.k6.io/papaparse/5.1.1/index.js";
// SharedArray provides a more memory-efficient way of dealing with potentially large CSV files
import { SharedArray } from "k6/data";

import { randomItem } from "https://jslib.k6.io/k6-utils/1.3.0/index.js";

import { deveExcluirEndereco } from "../resources/app-checkout/appCheckoutSelecaoEndereco.ts";
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';

// Inicializa variável de sku para o fluxo de B2C
const skusB2C = new SharedArray("skusB2C", function () {
  return papaparse.parse(open("../data/appCheckout/skus.csv"), {
    header: true,
  }).data;
});

// Inicializa variáveis de sku para o fluxo de Mktp
const skusMktp = new SharedArray("skuMktp", function () {
  return papaparse.parse(open("../data/appCheckout/sku_lojista_mktplc.csv"), {
    header: true,
  }).data;
});

const users = new SharedArray("users", function () {
  return papaparse.parse(open("../data/appCheckout/usuarios.csv"), {
    header: true,
  }).data;
});

export function appCheckoutB2C() {
  Checkout_Login();
}
