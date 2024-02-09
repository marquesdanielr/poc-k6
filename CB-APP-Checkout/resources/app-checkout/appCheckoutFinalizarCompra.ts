import { group, sleep, check, fail } from "k6";
// Httpx is a wrapper for the underlying http module in 'k6/http' (set global headers, timeouts, baseURL)
import { Httpx } from "https://jslib.k6.io/httpx/0.0.6/index.js";

import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

import { verifyResponse } from "../../common/utils.ts";

import {
  store,
  BASE_URL_CARRINHO,
  headers_default,
} from "../../userVariables.ts";

import { exec } from "k6/execution";

import { accessToken, idUsuario } from "./appCheckoutLogin.ts";

import { valorTotal, idParcelamento } from "./appCheckoutParcelamento.ts";

import {
  deveExcluirEndereco,
  idClienteEnderecoCad,
} from "./appCheckoutSelecaoEndereco.ts";

var numPedido = null;

const urlMobileHttpx = new Httpx({
  baseURL: `https://mobile-b2c.casasbahia.com.br`,
  headers: headers_default
});

const urlCarrinhoHttpx = new Httpx({
  baseURL: `https://${BASE_URL_CARRINHO}`,
  headers: headers_default
});

export function Checkout_Finalizar_Compra() {
  group(`Step ${store}_APP_Checkout_Finalizar_Compra (Agregado)`, () => {
    
    urlMobileHttpx.addHeader("Authorization", `Bearer ${accessToken}`);
    urlCarrinhoHttpx.addHeader("Authorization", `Bearer ${accessToken}`);

    //APP_Checkout_Finalizar_Compra - /checkout/pagamento/opcoes
    let res = urlMobileHttpx.get(
      "/checkout/pagamento/opcoes?cdcNovaEstrategia=true"
    );

    //APP_Checkout_Finalizar_Compra - /checkout/cartao/tokenizados
    res = urlMobileHttpx.get("/checkout/cartao/tokenizados");

    //APP_Checkout_Finalizar_Compra - /checkout/validarpagamento/naoseguro/cartao
    let body_pagamento = [
      {
        cartao: {
          nomeCliente: "JOE TEST",
          numero: "4111111111111111",
          numeroSeguranca: "111",
          validade: "01/2025",
        },
        tipoCartao: 1,
        idOpcaoParcelamento: idParcelamento,
        informacao3ds: {
          FluxoTresDSHlgObrigatorio: false,
          UserAgent: "android",
        },
        flagCdc: false,
        valorCompra: valorTotal,
      },
    ];

    res = urlMobileHttpx.post(
      "/checkout/validarpagamento/naoseguro/cartao",
      JSON.stringify(body_pagamento)
    );

    //APP_Checkout_Finalizar_Compra - /checkout/efetuarpagamento/naoseguro/cartao
    res = urlMobileHttpx.post(
      "/checkout/efetuarpagamento/naoseguro/cartao",
      JSON.stringify(body_pagamento)
    );

    try {
      numPedido = JSON.parse(res.body).idCompra;
      check (res, {
        'Compra finalizada': (res) => res.status == 200
      })
    } catch (e) {
    }
    
    let analisarRisco = false;
    if (numPedido == 0) {
      analisarRisco = true;
    }

    //APP_Checkout_Finalizar_Compra - /programafidelidade/permiteacumulo
    let body_fidelidade = {
      idCompra: `${numPedido}`,
      dataCompra: "2022-08-24T11:10:48.925Z",
      formasPagamento: [1],
      produtos: [
        {
          idSku: 1234567,
          idLojista: 15201,
          quantidade: 1,
          precoVenda: 1000,
        },
      ],
    };

    res = urlMobileHttpx.post(
      "/programafidelidade/permiteacumulo",
      JSON.stringify(body_fidelidade)
    );

    //APP_Checkout_Finalizar_Compra - Analisar risco se compra OK
    if (analisarRisco == true) {
      //Verificar se endereço foi cadastrado

      if (deveExcluirEndereco == true) {
        let body_remocao = {
          IdClienteEndereco: idClienteEnderecoCad,
        };

        res = urlMobileHttpx.delete(
          "/enderecos/naoseguro",
          JSON.stringify(body_remocao)
        );

       

        //Interrompe iteração deste usuário aqui.
        fail();
      }
    }

    //APP_Checkout_Finalizar_Compra - /coleta/salesforce/compra
    let body_compra = {
      IdUnico: idUsuario,
      CodigoPedido: numPedido,
      Origem: "PDP",
      TotalValorCompra: valorTotal,
      FormaPagamento: "1",
      BandeiraCartao: "1",
      QuantidadeParcelas: 1,
      StatusCompra: "APROVADA",
      ValorFrete: "9.99",
      Chave: "${idUsuario}",
      Produtos: [
        {
          Sku: "12345678",
          PrecoSite: valorTotal,
          PrecoDesconto: valorTotal,
          FlagMarketplace: true,
        },
      ],
    };

    res = urlMobileHttpx.post(
      "/coleta/salesforce/compra",
      JSON.stringify(body_compra)
    );


    //APP_Checkout_Finalizar_Compra - /coleta/evento/compra
    let body_evento_compra = {
      user: {
        email: idUsuario,
      },
      compraId: numPedido,
      produtos: [
        {
          pid: "123456",
          sku: "12345678",
          preco: valorTotal,
          quantidade: 1,
        },
      ],
      valorTotal: valorTotal,
    };

    res = urlMobileHttpx.post(
      "/coleta/evento/compra",
      JSON.stringify(body_evento_compra)
    );


    //APP_Checkout_Finalizar_Compra - /coleta/produtospatrocinados/conversao
    let body_conversao = {
      idCompra: numPedido,
      produtos: [
        {
          pid: "123456",
          sku: "12345678",
          preco: valorTotal,
          quantidade: 1,
        },
      ],
      valorTotal: valorTotal,
    };

    res = urlMobileHttpx.post(
      "/coleta/produtospatrocinados/conversao",
      JSON.stringify(body_conversao)
    );


    //APP_Checkout_Finalizar_Compra - /coleta/produtospatrocinados/promote/conversao

    let body_promote_conversao = {
      "idPedido": `${numPedido}`,
      "produtos": [
        {
          "sku": "12345678",
          "preco": `${valorTotal}`,
          "precoVenda": `${valorTotal}`,
          "quantidade": 1
        }
      ],
      "valor": `${valorTotal}`
    }

    res = urlMobileHttpx.post(
      "/coleta/produtospatrocinados/promote/conversao", JSON.stringify(body_promote_conversao)
    )

    //APP_Checkout_Finalizar_Compra - /Api/checkout/Carrinho.svc/FAF/AnaliseRisco
    let body_analise_risco = {
      AnaliseRiscoRequestDTO: {
        IdCompra: numPedido,
        IdUnidadeNegocio: 8,
      },
    };

    res = urlCarrinhoHttpx.post(
      "/Api/checkout/Carrinho.svc/FAF/AnaliseRisco",
      JSON.stringify(body_analise_risco)
    );
  });

  sleep(randomIntBetween(1, 2));
}

export { numPedido };
