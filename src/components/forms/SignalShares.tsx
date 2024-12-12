import { ChangeEventHandler, Dispatch } from "react";
import { Textarea } from "../ui/textarea";
import { FormValues } from "~/lib/form-configs";

export const SignalShares = ({
  isConfirmed,
  setFormValues,
}: {
  isConfirmed: boolean;
  setFormValues: Dispatch<FormValues>;
}) => {
  const handleTextInput = (event: ChangeEventHandler<HTMLTextAreaElement>) => {
    // @ts-expect-error change event type
    const description = event.target.value as string;
    // @ts-expect-error todo fix some type issues
    setFormValues((prevValues: FormValues) => {
      return { ...prevValues, description };
    });
  };

  return (
    <>
      {!isConfirmed && (
        <div className="my-3">
          <Textarea
            placeholder="Description"
            className="h-96"
            // @ts-expect-error change event type
            onChange={handleTextInput}
          />
        </div>
      )}
      {isConfirmed && (
        <div className="text-darkPurple text-[50px] font-bold w-full text-center bg-raisinBlack py-2 h-96">
          <p className="pt-24">Success</p>
        </div>
      )}
    </>
  );
};
