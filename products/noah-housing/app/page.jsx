import HousingWorkspace from "./workspace";
function approvedPublicUrl(raw) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash
      ? url.toString() : null;
  } catch { return null; }
}
export default function HousingPage() {
  return <HousingWorkspace arkUrl={approvedPublicUrl(process.env.NEXT_PUBLIC_NOAH_ARK_URL)} />;
}
