import { styled, keyframes } from "@root/stitches.config";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

const slideUpAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(-2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(-2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const StyledContent = styled(DropdownMenuPrimitive.Content, {
  minWidth: 200,
  backgroundColor: "$grayBg",
  borderRadius: 6,
  padding: 5,
  zIndex: "100",
  boxShadow: `
    0px 0px 2.2px rgba(0, 0, 0, 0.014),
    0px 0px 5.3px rgba(0, 0, 0, 0.02),
    0px 0px 10px rgba(0, 0, 0, 0.025),
    0px 0px 17.9px rgba(0, 0, 0, 0.03),
    0px 0px 33.4px rgba(0, 0, 0, 0.036),
    0px 0px 80px rgba(0, 0, 0, 0.05)
  `,

  "@media (prefers-reduced-motion: no-preference)": {
    animationDuration: "400ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: "transform, opacity",
    '&[data-state="open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
});

const itemStyles = {
  all: "unset",
  fontSize: 13,
  lineHeight: 1,
  color: "$gray12",
  fontFamily: "$500",
  borderRadius: 3,
  display: "flex",
  alignItems: "center",
  height: 25,
  padding: "0 5px",
  position: "relative",
  paddingLeft: 25,
  userSelect: "none",

  "&[data-disabled]": {
    color: "$gray8",
    pointerEvents: "none",
  },

  "&:focus": {
    backgroundColor: "$accent5",
    color: "$accent12",
  },
};

const StyledItem = styled(DropdownMenuPrimitive.Item, { ...itemStyles });
const StyledTriggerItem = styled(DropdownMenuPrimitive.TriggerItem, {
  '&[data-state="open"]': {
    backgroundColor: "$accent4",
    color: "$accent11",
  },
  ...itemStyles,
});

const StyledCheckboxItem = styled(DropdownMenuPrimitive.CheckboxItem, {
  ...itemStyles,
});

const StyledItemIndicator = styled(DropdownMenuPrimitive.ItemIndicator, {
  position: "absolute",
  left: 0,
  width: 25,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

const StyledArrow = styled(DropdownMenuPrimitive.Arrow, {
  fill: "#fff",
});

const IconTrigger = styled("button", {
  all: "unset",
  height: "100%",
  aspectRatio: "1/1",
  fontFamily: "inherit",
  borderRadius: "100%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "$grayTextSecondary",
  backgroundColor: "$grayUIBg",
  "&:hover": { backgroundColor: "$grayUIBgHover" },
});

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = StyledContent;
export const DropdownMenuIconTrigger = IconTrigger;
export const DropdownMenuItem = StyledItem;
export const DropdownMenuItemIndicator = StyledItemIndicator;
export const DropdownMenuTriggerItem = StyledTriggerItem;
export const DropdownMenuCheckboxItem = StyledCheckboxItem;
export const DropdownMenuArrow = StyledArrow;
