import { Href, Link } from "expo-router";
import { openBrowserAsync, WebBrowserPresentationStyle } from "expo-web-browser";
import { type ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: Href & string };

export function ExternalLink({ href, accessibilityLabel, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? "Open external documentation link"}
      accessibilityHint="Opens this page in a browser"
      onPress={async (event) => {
        if (process.env.EXPO_OS !== "web") {
          event.preventDefault();
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}
