export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjE0ODYyLCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4Yzg5MTM2MDhBZDdDZDJGODAyMjlmNGNGQjNFMTU4MjU0ODFGZDM5MyJ9",
      payload: "eyJkb21haW4iOiJ3aGlzcGVycy5kYW9oYXVzLmNsdWIifQ",
      signature:
        "MHg4MDNjZDhkZGExNjMzYjI3MmVmZjY5YzAwZGNiMTVjYjVhNTAyMDEwODY1N2QwMDQ3OTVlMDNmM2ZkMzZiZjkwNDgyNGE2MmJmZDU5N2QyMzI2NzAxZDdlYjdhMjZjNTA3MmRmODRjN2QzM2RlOTlhMWE0NTRlMTAwN2E3NjQ1NzFj",
    },
    frame: {
      version: "0.0.1",
      name: "Farcastle Whispers",
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#17151F",
      homeUrl: appUrl,
    },
  };

  return Response.json(config);
}
