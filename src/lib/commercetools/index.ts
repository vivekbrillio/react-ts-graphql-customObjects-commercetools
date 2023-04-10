import SdkAuth, { TokenProvider } from "@commercetools/sdk-auth";
import Config from "./config";
import { apolloClient } from "./helpers/client";
import { GET_PRODUCTS, GET_CUSTOM_OBJECTS_BY_PRODUCT_ID } from "../../graphql/queries";

import type {
  CtTokenInfo,
  CustomerSignMeInDraft,
  GetAllProductsQuery,
  GetAllProductsQueryVariables,
  GetCustomObjectByProductIdsQuery,
  GetCustomObjectByProductIdsQueryVariables
} from "./types";
import {
  COMMERCETOOLS_MAX_LIMIT,
  COMMERCETOOLS_MIN_LIMIT,
  COUNTRY,
  CURRENCY_CODE,
  LOCALE,
} from "../../utils/constants";

type GetAllProductsProps = {
  limit: number;
};

type GetCustomObjectsByProductIdProps = {
  limit: number;
}

const sdkAuth = new SdkAuth(Config.auth);

async function generateAnonymousTokenInfo(): Promise<CtTokenInfo> {
  const tokenFlow = await sdkAuth.anonymousFlow();
  const tokenProvider = new TokenProvider({ sdkAuth }, tokenFlow);
  const tokenInfo = await tokenProvider.getTokenInfo();
  return tokenInfo;
}

async function generateCustomerTokenInfo(
  props: Pick<CustomerSignMeInDraft, "email" | "password">
): Promise<CtTokenInfo> {
  const { email, password } = props;
  const tokenFlow = await sdkAuth.customerPasswordFlow({
    username: email,
    password,
  });
  const tokenProvider = new TokenProvider({ sdkAuth }, tokenFlow);
  const tokenInfo = await tokenProvider.getTokenInfo();
  return tokenInfo;
}

async function refreshTokenInfo(
  expiredTokenInfo: CtTokenInfo
): Promise<CtTokenInfo> {
  const tokenProvider = new TokenProvider({ sdkAuth }, expiredTokenInfo);
  const tokenInfo = await tokenProvider.getTokenInfo();
  return tokenInfo;
}

async function getProducts(props: GetAllProductsProps) {
  let { limit } = props;

  limit = Math.min(
    Math.max(limit, COMMERCETOOLS_MIN_LIMIT),
    COMMERCETOOLS_MAX_LIMIT
  );

  const { data, loading, error } = await apolloClient.query<
    GetAllProductsQuery,
    GetAllProductsQueryVariables
  >({
    query: GET_PRODUCTS,
    variables: {
      sorts: null,
      filters: [
        {
          model: {
            range: {
              path: "variants.scopedPrice.value.centAmount",
              ranges: [
                {
                  from: "0",
                  to: "1000000000000",
                },
              ],
            },
          },
        },
      ],
      text: "",
      locale: LOCALE,
      limit: limit,
      offset: 0,
      priceSelector: {
        currency: CURRENCY_CODE,
        country: COUNTRY,
        channel: null,
        customerGroup: null,
      },
    },
  });
  const products = data.productProjectionSearch.results.map((result) => result);

  return { data: { products }, loading, error };
}

async function getCustomObjectsByProductId(props: GetCustomObjectsByProductIdProps) {
  let { limit } = props;

  const { data, loading, error } = await apolloClient.query<
    GetCustomObjectByProductIdsQuery,
    GetCustomObjectByProductIdsQueryVariables
  >({
    query: GET_CUSTOM_OBJECTS_BY_PRODUCT_ID,
    variables: {
      container: "reference-demo-container",
      where: "(value(product(id=\"14d6c28c-d118-4356-8c04-7c1d96cd6a0a\")))",
      limit: limit,
    },
  });
  const customObject = data.customObjects.results.map((result) => result);

  return { data: { customObject }, loading, error };
}

export const Commercetools = {
  generateAnonymousTokenInfo,
  generateCustomerTokenInfo,
  refreshTokenInfo,
  getProducts,
  getCustomObjectsByProductId
};
