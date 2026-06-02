import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import BreakfastDiningOutlinedIcon from "@mui/icons-material/BreakfastDiningOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import CookieOutlinedIcon from "@mui/icons-material/CookieOutlined";
import DinnerDiningOutlinedIcon from "@mui/icons-material/DinnerDiningOutlined";
import EmojiFoodBeverageOutlinedIcon from "@mui/icons-material/EmojiFoodBeverageOutlined";
import EmojiNatureOutlinedIcon from "@mui/icons-material/EmojiNatureOutlined";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import FoodBankOutlinedIcon from "@mui/icons-material/FoodBankOutlined";
import GrassOutlinedIcon from "@mui/icons-material/GrassOutlined";
import IcecreamOutlinedIcon from "@mui/icons-material/IcecreamOutlined";
import KebabDiningOutlinedIcon from "@mui/icons-material/KebabDiningOutlined";
import LiquorOutlinedIcon from "@mui/icons-material/LiquorOutlined";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import LocalDrinkOutlinedIcon from "@mui/icons-material/LocalDrinkOutlined";
import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import NoFoodOutlinedIcon from "@mui/icons-material/NoFoodOutlined";
import ParkOutlinedIcon from "@mui/icons-material/ParkOutlined";
import RamenDiningOutlinedIcon from "@mui/icons-material/RamenDiningOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SetMealOutlinedIcon from "@mui/icons-material/SetMealOutlined";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import SportsBarOutlinedIcon from "@mui/icons-material/SportsBarOutlined";
import TableRestaurantOutlinedIcon from "@mui/icons-material/TableRestaurantOutlined";
import TakeoutDiningOutlinedIcon from "@mui/icons-material/TakeoutDiningOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import YardOutlinedIcon from "@mui/icons-material/YardOutlined";
import type { SvgIconProps } from "@mui/material/SvgIcon";

import type { ComponentType } from "react";

export type ProductIconOption = {
  id: string;
  label: string;
  Icon: ComponentType<SvgIconProps>;
};

const categoryAliasMap: Record<string, string> = {
  alimentos: "comidas-rapidas",
  paquetes: "combos",
};

const defaultIconOptions: ProductIconOption[] = [
  { id: "restaurant_menu", label: "Menú general", Icon: RestaurantMenuOutlinedIcon },
  { id: "restaurant", label: "Comida general", Icon: RestaurantOutlinedIcon },
  { id: "set_meal", label: "Plato", Icon: SetMealOutlinedIcon },
  { id: "shopping_basket", label: "Producto", Icon: ShoppingBasketOutlinedIcon },
];

const categoryIconMap: Record<string, ProductIconOption[]> = {
  bebidas: [
    { id: "local_drink", label: "Bebida", Icon: LocalDrinkOutlinedIcon },
    { id: "local_cafe", label: "Café", Icon: LocalCafeOutlinedIcon },
    { id: "emoji_food_beverage", label: "Bebida caliente", Icon: EmojiFoodBeverageOutlinedIcon },
    { id: "water_drop", label: "Agua", Icon: WaterDropOutlinedIcon },
    { id: "sports_bar", label: "Bebida fría", Icon: SportsBarOutlinedIcon },
    { id: "liquor", label: "Jugo / vaso", Icon: LiquorOutlinedIcon },
  ],
  "comidas-rapidas": [
    { id: "fastfood", label: "Comida rápida", Icon: FastfoodOutlinedIcon },
    { id: "lunch_dining", label: "Almuerzo", Icon: LunchDiningOutlinedIcon },
    { id: "kebab_dining", label: "Snack caliente", Icon: KebabDiningOutlinedIcon },
    { id: "ramen_dining", label: "Plato", Icon: RamenDiningOutlinedIcon },
    { id: "dinner_dining", label: "Comida", Icon: DinnerDiningOutlinedIcon },
    { id: "takeout_dining", label: "Para llevar", Icon: TakeoutDiningOutlinedIcon },
  ],
  dulces: [
    { id: "cake", label: "Pastel", Icon: CakeOutlinedIcon },
    { id: "icecream", label: "Helado", Icon: IcecreamOutlinedIcon },
    { id: "cookie", label: "Galleta", Icon: CookieOutlinedIcon },
    { id: "bakery_dining", label: "Repostería", Icon: BakeryDiningOutlinedIcon },
    { id: "card_giftcard", label: "Dulce sorpresa", Icon: CardGiftcardOutlinedIcon },
    { id: "no_food", label: "Sin azúcar / especial", Icon: NoFoodOutlinedIcon },
  ],
  panaderia: [
    { id: "bakery_dining", label: "Panadería", Icon: BakeryDiningOutlinedIcon },
    { id: "breakfast_dining", label: "Desayuno", Icon: BreakfastDiningOutlinedIcon },
    { id: "table_restaurant", label: "Pan artesanal", Icon: TableRestaurantOutlinedIcon },
    { id: "food_bank", label: "Pan del día", Icon: FoodBankOutlinedIcon },
    { id: "takeout_dining", label: "Empaque", Icon: TakeoutDiningOutlinedIcon },
    { id: "shopping_basket", label: "Canasta", Icon: ShoppingBasketOutlinedIcon },
  ],
  snacks: [
    { id: "fastfood", label: "Snack", Icon: FastfoodOutlinedIcon },
    { id: "food_bank", label: "Paquete", Icon: FoodBankOutlinedIcon },
    { id: "kebab_dining", label: "Mecato", Icon: KebabDiningOutlinedIcon },
    { id: "takeout_dining", label: "Individual", Icon: TakeoutDiningOutlinedIcon },
    { id: "shopping_basket", label: "Combo snack", Icon: ShoppingBasketOutlinedIcon },
    { id: "set_meal", label: "Porción", Icon: SetMealOutlinedIcon },
  ],
  frutas: [
    { id: "emoji_nature", label: "Fruta", Icon: EmojiNatureOutlinedIcon },
    { id: "yard", label: "Natural", Icon: YardOutlinedIcon },
    { id: "park", label: "Fresco", Icon: ParkOutlinedIcon },
    { id: "grass", label: "Verde", Icon: GrassOutlinedIcon },
    { id: "spa", label: "Salud", Icon: SpaOutlinedIcon },
    { id: "restaurant_menu", label: "En porción", Icon: RestaurantMenuOutlinedIcon },
  ],
  saludables: [
    { id: "spa", label: "Saludable", Icon: SpaOutlinedIcon },
    { id: "park", label: "Orgánico", Icon: ParkOutlinedIcon },
    { id: "grass", label: "Verde", Icon: GrassOutlinedIcon },
    { id: "yard", label: "Natural", Icon: YardOutlinedIcon },
    { id: "emoji_nature", label: "Fruta / verdura", Icon: EmojiNatureOutlinedIcon },
    { id: "food_bank", label: "Porción saludable", Icon: FoodBankOutlinedIcon },
  ],
  combos: [
    { id: "shopping_basket", label: "Combo", Icon: ShoppingBasketOutlinedIcon },
    { id: "set_meal", label: "Menú combinado", Icon: SetMealOutlinedIcon },
    { id: "table_restaurant", label: "Bandeja", Icon: TableRestaurantOutlinedIcon },
    { id: "takeout_dining", label: "Combo para llevar", Icon: TakeoutDiningOutlinedIcon },
    { id: "food_bank", label: "Paquete completo", Icon: FoodBankOutlinedIcon },
    { id: "card_giftcard", label: "Especial", Icon: CardGiftcardOutlinedIcon },
  ],
};

const iconMap = new Map<string, ProductIconOption>();

for (const option of defaultIconOptions) {
  iconMap.set(option.id, option);
}

for (const options of Object.values(categoryIconMap)) {
  for (const option of options) {
    if (!iconMap.has(option.id)) {
      iconMap.set(option.id, option);
    }
  }
}

export function normalizeCategorySlug(slug: string) {
  return slug
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getProductIconOptionsByCategory(categorySlug?: string | null) {
  if (!categorySlug) {
    return defaultIconOptions;
  }

  const normalizedSlug = normalizeCategorySlug(categorySlug);
  const resolvedKey = categoryAliasMap[normalizedSlug] ?? normalizedSlug;

  return categoryIconMap[resolvedKey] ?? defaultIconOptions;
}

export function getProductIconOption(iconId?: string | null) {
  if (!iconId) {
    return undefined;
  }

  return iconMap.get(iconId);
}

export function isKnownProductIconId(iconId?: string | null) {
  if (!iconId) {
    return false;
  }

  return iconMap.has(iconId);
}
