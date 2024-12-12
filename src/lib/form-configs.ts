// import { SignalShares } from "~/components/forms/SignalShares";
import { TX } from "./tx-prepper/tx";
import { TXLego } from "./tx-prepper/prepper-types";

export type FormConfig = {
  submitButtonText?: string;
  tx: TXLego;
  //   formComponent: JSX.Element;
};

export type FormValues = Record<string, string>;

export const FORM_CONFIGS: Record<string, FormConfig> = {
  POST_SIGNAL: {
    tx: TX.POST_SIGNAL,
    // formComponent: SignalShares,
  },
  SIGNAL_SHARES: {
    submitButtonText: "Send it into the cracks of the castle wall",
    tx: TX.POST_SIGNAL,
    // formComponent: SignalShares,
  },
};
