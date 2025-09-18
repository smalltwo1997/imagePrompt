import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import type { MarketingConfig } from "~/types";

export const getMarketingConfig = async ({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}): Promise<MarketingConfig> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dict = await getDictionary(lang);
  return {
    mainNav: [
      {
        title: "Home",
        href: "/",
      },
      {
        title: "Inspiration",
        href: "/inspiration",
      },
      {
        title: "Tutorials",
        href: "/tutorials",
      },
      {
        title: "Tools",
        href: "/tools",
      },
      {
        title: "Image to Prompt",
        href: "/image-to-prompt",
      },
      {
        title: "Pricing",
        href: "/pricing",
      },
    ],
  };
};
