import { LOCAL_ABI } from "./abi/abis";
import { CONTRACT_KEYCHAINS } from "./contractKeychains";
import { ProposalTypeIds, TXLego } from "./legoTypes";
import { buildMultiCallTX, POSTER_TAGS } from "./proposal";

// const nestInArray = (arg: ValidArgType | ValidArgType[]): NestedArray => {
//   return {
//     type: "nestedArray",
//     args: Array.isArray(arg) ? arg : [arg],
//   };
// };

export const TX: Record<string, TXLego> = {
  POST_SIGNAL: buildMultiCallTX({
    id: "POST_SIGNAL",
    JSONDetails: {
      type: "JSONDetails",
      jsonSchema: {
        title: `.formValues.title`,
        description: `.formValues.description`,
        contentURI: `.formValues.link`,
        contentURIType: { type: "static", value: "url" },
        proposalType: { type: "static", value: ProposalTypeIds.Signal },
      },
    },
    actions: [
      {
        contract: {
          type: "static",
          contractName: "Poster",
          abi: LOCAL_ABI.POSTER,
          targetAddress: CONTRACT_KEYCHAINS.POSTER,
        },
        method: "post",
        operations: { type: "static", value: 0 },
        args: [
          {
            type: "JSONDetails",
            jsonSchema: {
              daoId: ".daoId",
              table: { type: "static", value: "signal" },
              queryType: { type: "static", value: "list" },
              title: `.formValues.title`,
              description: `.formValues.description`,
              link: `.formValues.link`,
            },
          },
          { type: "static", value: POSTER_TAGS.daoDatabaseProposal },
        ],
      },
    ],
  }),
};
