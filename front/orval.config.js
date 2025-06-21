module.exports = {
  "garden-store-api": {
    input: {
      target: "../back/openapi.json",
    },
    output: {
      mode: "split",
      target: "src/shared/api/generated",
      schemas: "src/shared/api/generated/model",
      client: "react-query",
      httpClient: "axios",
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: "src/shared/api/orvalInstance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
};
