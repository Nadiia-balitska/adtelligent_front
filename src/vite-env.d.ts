/// <reference types="vite/client" />


declare global {
  namespace JSX {
    interface IntrinsicElements {
      "line-item-form": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "data-api-origin"?: string;
      };
    }
  }
}

export {};