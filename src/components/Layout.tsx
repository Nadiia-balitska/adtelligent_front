import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Header />

      <div className="flex justify-center my-4">
        {/* biome-ignore lint/correctness/useUniqueElementIds: Prebid/GPT requires fixed IDs */}
        <div id="div-gpt-top" style={{ minWidth: 728, minHeight: 90 }}></div>
      </div>

      <main className="mx-auto max-w-5xl p-4 flex gap-4">
        <div className="flex-1">
          <Outlet />
        </div>

        <aside className="w-[300px]">
          {/* biome-ignore lint/correctness/useUniqueElementIds: Prebid/GPT requires fixed IDs */}
          <div id="div-gpt-side" style={{ minWidth: 300, minHeight: 250 }}></div>
        </aside>
      </main>
    </div>
  );
};

export default Layout;
