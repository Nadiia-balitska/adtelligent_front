/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
/** biome-ignore-all lint/a11y/useIframeTitle: <explanation> */
import { Outlet } from "react-router-dom";
import Header from "./Header";
import "../../../public/prebid.js";

const Layout = () => {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 [background:radial-gradient(60rem_40rem_at_50%_-10%,rgb(99_102_241/0.05),transparent_60%),radial-gradient(40rem_30rem_at_110%_10%,rgb(168_85_247/0.05),transparent_60%)] dark:bg-zinc-950 dark:text-zinc-100">
      <Header />
      <div className="flex justify-center">
        <iframe id="ad-slot" width="300" height="250" frameborder="0" scrolling="no"></iframe>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <iframe id="ad-slot-2" width="300" height="250" frameborder="0" scrolling="no"></iframe>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <Outlet />
          </div>

           <div  className="flex justify-center">
        <iframe id="div-gpt-bottom"  width="300" height="250" frameborder="0" scrolling="no"></iframe>
      </div>
      
        </div>
      </main>
    </div>
  );
};

export default Layout;
