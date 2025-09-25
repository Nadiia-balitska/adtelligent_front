declare module "virtual:plugins" {}
declare module "*.jsx" {
  import type React from "react";
  const C: React.ComponentType<any>;
  export default C;
}
