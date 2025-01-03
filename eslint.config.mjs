import antfu from "@antfu/eslint-config"
import tailwindcss from "eslint-plugin-tailwindcss"

export default antfu(
  {
    react: true,
    ignores: ["**/dist", "**/node_modules"],
    stylistic: {
      quotes: "double",
    },
  },
  ...tailwindcss.configs["flat/recommended"],
)
