/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import React from "react";

type Props = React.HTMLAttributes<HTMLElement> & {
  "data-api-origin"?: string;
  style?: React.CSSProperties;
};

export default function LineItemForm(props: Props) {
  return React.createElement("line-item-form", props as any);
}
