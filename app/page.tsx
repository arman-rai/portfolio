import Terminal from "@/components/terminal/Terminal";
import { headers } from "next/headers";

export default async function Home() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    realIp ||
    "127.0.0.1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#111827,_#020617)]">
      <Terminal ip={ip} />
    </div>
  );
}
