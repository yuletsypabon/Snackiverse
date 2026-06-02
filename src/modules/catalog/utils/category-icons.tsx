import AppleIcon from "@mui/icons-material/Apple";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
import BlenderIcon from "@mui/icons-material/Blender";
import CakeIcon from "@mui/icons-material/Cake";
import CategoryIcon from "@mui/icons-material/Category";
import CoffeeIcon from "@mui/icons-material/Coffee";
import DinnerDiningIcon from "@mui/icons-material/DinnerDining";
import EggIcon from "@mui/icons-material/Egg";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import GrassIcon from "@mui/icons-material/Grass";
import IcecreamIcon from "@mui/icons-material/Icecream";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import RamenDiningIcon from "@mui/icons-material/RamenDining";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SetMealIcon from "@mui/icons-material/SetMeal";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import SpaIcon from "@mui/icons-material/Spa";
import TapasIcon from "@mui/icons-material/Tapas";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ComponentType } from "react";

export const CATEGORY_ICON_MAP: Record<string, ComponentType<SvgIconProps>> = {
  Fastfood: FastfoodIcon,
  LocalDrink: LocalDrinkIcon,
  Coffee: CoffeeIcon,
  Cake: CakeIcon,
  Apple: AppleIcon,
  BakeryDining: BakeryDiningIcon,
  Icecream: IcecreamIcon,
  LunchDining: LunchDiningIcon,
  DinnerDining: DinnerDiningIcon,
  LocalPizza: LocalPizzaIcon,
  Restaurant: RestaurantIcon,
  RamenDining: RamenDiningIcon,
  SetMeal: SetMealIcon,
  Egg: EggIcon,
  Tapas: TapasIcon,
  SoupKitchen: SoupKitchenIcon,
  EmojiFoodBeverage: EmojiFoodBeverageIcon,
  Blender: BlenderIcon,
  LocalBar: LocalBarIcon,
  Grass: GrassIcon,
  Spa: SpaIcon,
  Category: CategoryIcon,
};

export type CategoryIconKey = keyof typeof CATEGORY_ICON_MAP;

export const CATEGORY_ICON_LIST = Object.keys(CATEGORY_ICON_MAP) as CategoryIconKey[];

type CategoryIconProps = SvgIconProps & { iconKey: string | null | undefined };

export function CategoryIconDisplay({ iconKey, ...props }: CategoryIconProps) {
  const Icon = iconKey ? (CATEGORY_ICON_MAP[iconKey] ?? CategoryIcon) : CategoryIcon;
  return <Icon {...props} />;
}
