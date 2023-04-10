import type {
    GetCustomObjectByProductIdsQuery,
    GetCustomObjectByProductIdsQueryVariables,
  } from "../../graphql/__generated__/graphql";
  import { GET_CUSTOM_OBJECTS_BY_PRODUCT_ID } from "../../graphql/queries";
  import { useQuery } from "@apollo/client";
  
  function CustomObjects() {
    const { data, error, loading } = useQuery<
    GetCustomObjectByProductIdsQuery,
    GetCustomObjectByProductIdsQueryVariables
    >(GET_CUSTOM_OBJECTS_BY_PRODUCT_ID, {
      variables: {
        container: "reference-demo-container",
        where: "(value(product(id=\"14d6c28c-d118-4356-8c04-7c1d96cd6a0a\")))",
        limit: 5,
      },
    });
    if (loading) return <> Loading</>;
    if (error) return <>{JSON.stringify(error)}</>;
    return <><p>This is custom object info</p><br />{JSON.stringify(data)}</>;
  }
  
  export default CustomObjects;
  