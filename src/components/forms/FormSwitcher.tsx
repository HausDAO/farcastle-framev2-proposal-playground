import { Dispatch } from "react";
import { FormValues } from "~/lib/form-configs";
import { Signal } from "./Signal";
import { RequestMembership } from "./RequestMembership";

export const FormSwitcher = ({
  formid,
  isConfirmed,
  formValues,
  validFields,
  setFormValues,
  setValidFields,
}: {
  formid: string;
  isConfirmed: boolean;
  formValues: FormValues;
  validFields: boolean;
  setFormValues: Dispatch<FormValues>;
  setValidFields: Dispatch<boolean>;
}) => {
  const renderForm = () => {
    switch (formid) {
      case "POST_SIGNAL":
        return (
          <Signal
            isConfirmed={isConfirmed}
            formValues={formValues}
            validFields={validFields}
            setFormValues={setFormValues}
            setValidFields={setValidFields}
          />
        );
      case "REQUEST_MEMBERSHIP":
        return (
          <RequestMembership
            isConfirmed={isConfirmed}
            formValues={formValues}
            validFields={validFields}
            setFormValues={setFormValues}
            setValidFields={setValidFields}
          />
        );

      default:
        return null;
    }
  };
  return <>{renderForm()}</>;
};
