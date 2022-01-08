import { useRef, RefObject, forwardRef } from "react";
import { useButton } from "@react-aria/button";

import { styled } from "@root/stitches.config";

export const StyledButton = styled("button", {
  padding: "7px 14px",
  fontSize: "$14",
  fontFamily: "$500",
  backgroundColor: "$accentUIBg",
  border: "1px solid $accentBorder",
  borderRadius: "6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "$grayTextPrimary",

  "&:hover": {
    backgroundColor: "$accentUIBgHover",
    borderColor: "$accentBorderHover",
  },
});

type Props = {
  children?: React.ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  (props, forwardedRef) => {
    const internalRef = useRef(null);
    const ref = forwardedRef || internalRef;

    let { buttonProps } = useButton(props, ref as RefObject<HTMLElement>);

    return (
      <StyledButton {...buttonProps} ref={ref}>
        {props.children}
      </StyledButton>
    );
  }
);
