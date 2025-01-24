import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chatBg: "#0E1621",
        leftBarBg: "#17212B",
        darkGray: "#777777",
        darkBlue: "#1566A3",
        lightBlue: "#60CDFF",
        mainGreen: "#6CCB5F",
      },
      fontFamily: {
        vazirRegular: "vazirRegular",
        vazirBold: "vazirBold",
        vazirLight: "vazirLight",
      },
    },
  },
  plugins: [
    heroui(),
    function ({
      addVariant,
    }: {
      addVariant: (variantName: string, selector: string) => void;
    }) {
      addVariant("ch", "& > *");
      addVariant("ch-hover", "& > *:hover");
    },
  ],
} satisfies Config;
