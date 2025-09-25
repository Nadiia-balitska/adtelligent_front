/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 [background:radial-gradient(60rem_40rem_at_50%_-10%,rgb(99_102_241/0.05),transparent_60%),radial-gradient(40rem_30rem_at_110%_10%,rgb(168_85_247/0.05),transparent_60%)] dark:bg-zinc-950 dark:text-zinc-100">
      <Header />

      <section className="mx-auto mt-6 mb-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 p-4 md:p-5 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-900/70">
            <div
              id="div-gpt-top"
              className="mx-auto my-2 flex items-center justify-center"
              style={{ minWidth: 728, minHeight: 90 }}
            ></div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <Outlet />
          </div>

          <aside className="w-full lg:w-[320px]">
            <div className="sticky top-24 rounded-2xl border border-zinc-200/70 bg-white/70 p-4 md:p-5 shadow-sm backdrop-blur mb-8 dark:border-zinc-800/60 dark:bg-zinc-900/70">
              <div
                id="div-gpt-side"
                className="my-2 flex items-center justify-center"
                style={{  minWidth: 728, minHeight: 90 }}
              ></div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Layout;
