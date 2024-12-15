/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const alt = "Farcastle Proposals Whisper";
export const size = {
  width: 600,
  height: 400,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center relative bg-raisinBlack">
        <img
          src="https://daohaus.mypinata.cloud/ipfs/QmeE6APDGW53dtvae8Z8wQVXbQiFYUwGUXiWDcX1AV2GdH"
          width="600px"
          alt="the fly"
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
