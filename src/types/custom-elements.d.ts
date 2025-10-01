
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "line-item-form": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        action?: string;
      };
    }
  }
}
