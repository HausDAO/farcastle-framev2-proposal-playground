import { ChangeEvent, Dispatch, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import { FormValues } from "~/lib/form-configs";
import { Input } from "../ui/input";

export const RequestMembership = ({
  isConfirmed,
  formValues,
  validFields,
  setFormValues,
  setValidFields,
}: {
  isConfirmed: boolean;
  formValues: FormValues;
  validFields: boolean;
  setFormValues: Dispatch<FormValues>;
  setValidFields: Dispatch<boolean>;
}) => {
  const handleTextInput = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    console.log("event.target", event.target.id);
    const value = event.target.value as string;
    // @ts-expect-error todo fix some type issues
    setFormValues((prevValues: FormValues) => {
      return { ...prevValues, [event.target.id]: value };
    });
  };

  useEffect(() => {
    console.log("formValues", formValues);
    const hasDescription = formValues.description?.length > 5;
    const hasTitle = formValues.title?.length > 5;
    const hasSharesOrLoot =
      Number(formValues.sharesRequested) > 0 ||
      Number(formValues.lootRequested) > 0;

    if (hasDescription && hasTitle && hasSharesOrLoot) {
      setValidFields(true);
    } else if (validFields) {
      setValidFields(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  return (
    <>
      {!isConfirmed && (
        <>
          <div className="my-3">
            <Input
              placeholder="Title"
              id="title"
              onChange={(event) => handleTextInput(event)}
            />
          </div>
          <div className="my-3">
            <Textarea
              placeholder="Description"
              className="h-60"
              id="description"
              onChange={(event) => handleTextInput(event)}
            />
          </div>
          <div className="my-3">
            <Input
              placeholder="Link"
              id="link"
              type="url"
              onChange={(event) => handleTextInput(event)}
            />
          </div>
          <div className="my-3">
            <Input
              placeholder="Shares"
              id="sharesRequested"
              type="number"
              onChange={(event) => handleTextInput(event)}
            />
          </div>
          <div className="my-3">
            <Input
              placeholder="Loot"
              id="lootRequested"
              type="number"
              onChange={(event) => handleTextInput(event)}
            />
          </div>
        </>
      )}
      {isConfirmed && (
        <div className="text-darkPurple text-[50px] font-bold w-full text-center bg-raisinBlack py-2 h-96">
          <p className="pt-24">Success</p>
        </div>
      )}
    </>
  );
};
