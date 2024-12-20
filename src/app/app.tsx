"use client";

import dynamic from "next/dynamic";

// const Demo = dynamic(() => import("~/components/Demo"), {
//   ssr: false,
// });

// export default function App(
//   { title }: { title?: string } = { title: "demo app.tsx title" }
// ) {
//   return <Demo title={title} />;
// }

const Home = dynamic(() => import("~/components/Home"), {
  ssr: false,
});

export default function App() {
  return <Home />;
}
