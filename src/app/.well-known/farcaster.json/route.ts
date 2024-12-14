export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjE0ODYyLCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4Yzg5MTM2MDhBZDdDZDJGODAyMjlmNGNGQjNFMTU4MjU0ODFGZDM5MyJ9",
      payload: "eyJkb21haW4iOiJwcm9wb3NhbHMuZGFvaGF1cy5jbHViIn0",
      signature:
        "MHhiYzk5N2FkZjIxMTYyMTBjNDA4ZWEyMmYwYzExMTNjZmM4NmU0ZGFjZTI0NmU4OTBkNGQ5MmFhOTdiNWY5ZjU4NjFlZGYwMjdjNmVjMjU5MWU5YjIwZjA2NGYxMmQ3ZDMxNjYwM2JlNzY1MGYzMTcwNTAwNGY4YjYyODU4NDZkZjFi",
    },
    frame: {
      version: "0.0.0",
      name: "Farcastle Proposals",
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      homeUrl: appUrl,
    },
  };

  return Response.json(config);
}
