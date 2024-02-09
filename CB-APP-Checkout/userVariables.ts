// User Defined Variables
export const BANDEIRA = __ENV.BANDEIRA || `casasbahia`;
export const BASE_URL_MOBILE = `mobile-b2c.casasbahia.com.br`; // urlMobileHttpx
export const BASE_URL_DESKTOP = `www.casasbahia.com.br`; // urlDesktopHttpx
export const BASE_URL_CARRINHO = `carrinho.casasbahia.com.br`;
export const store = __ENV.store || `CB`;
export const h_name = `x-vvcache`;
export const idBandeira = 10037;
export const x_token =
  "exp=1703181957~acl=/*~hmac=276f68b4330cd54d9f7cc3c118b5b8c61c38a177ca49b807a6f758efa866097e";

export const header_value_test = `TTL123C45ST-6789-U0V1W-XY23-ZA4567BC8`;
export const header_value = `4BC7-DE01-TTL123C45ST-6789-U0V1W-XY23`;
export const header_value_app = `V4W3X-DE45-YZ6789IJ-TTL123C45ST-01234`;


export const headers_default = {
  "User-Agent": `ViaVarejo androidApp StressTest ` + h_name,
  Accept: "application/json",
  "Accept-Language": "pt-BR",
  "X-DynaTrace": `SN=APP-${store}`,
  "x-vvtest": header_value_test,
  "x-vvapp": header_value_app,
  "X-Token":
    `${x_token}`,
  "Content-type": "application/json; charset=UTF-8",
  Referer: "https://android.com.br",
  "X-Version": "8.5.99",
  "X-DeviceBrand": "Samsung",
  "X-PlatformVersion": "11",
  "X-AppVersion": "8.5.99",
  "X-BuildCode": "8.5.99",
  "X-AppName": "ViaVarejo",
  "X-Fingerprint": "3459802694",
  "X-IPAddress": "fe00::1cd4:10b9:bc33:8e490",
  "X-Platform": "android",
  "X-Device": "android",
  "Host": `${BASE_URL_MOBILE}`,
  "x-vvcache": header_value
}