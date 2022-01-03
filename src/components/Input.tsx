import { useRef, useState } from "react";
import { useTextField } from "@react-aria/textfield";

import { styled } from "@root/stitches.config";

const Container = styled("div", {
  display: "flex",
  flexDirection: "column",

  "&:not(:last-child)": {
    marginBottom: "12px",
  },
});

const InputContainer = styled("div", {
  position: "relative",
});

const Label = styled("label", {
  color: "$grayTextSecondary",
  fontFamily: "$500",
  marginBottom: "6px",
  fontSize: "$14",
  position: "absolute",
  left: "5px",
  backgroundColor: "transparent",
  padding: "0 10px",
  top: "50%",
  transform: "translate(0, -50%)",
  pointerEvents: "none",

  transition:
    "top 0.1s ease-out, transform 0.1s ease-out, background-color 0.2s ease-out",
});

type Props = {
  value: string;
  onChange: (value: string) => void;
  type: "text" | "password";
  label?: string;
  labelActiveBgColor?: string;
  errorMessage?: string;
  description?: string;
};

export const Input: React.FC<Props> = (props) => {
  const { label } = props;
  let ref = useRef(null);
  let { labelProps, inputProps, descriptionProps, errorMessageProps } =
    useTextField(props, ref);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(event.target.value);
  };

  const labelActiveStyles = {
    top: "-8px",
    transform: "scale(0.8)",
    backgroundColor: `${props.labelActiveBgColor ?? "$grayBg"}`,
  };

  const [StyledInput] = useState(() =>
    styled("input", {
      padding: "8px 16px",
      border: "1px solid $grayBorder",
      borderRadius: "2px",
      fontSize: "$14",
      maxWidth: "300px",
      backgroundColor: "transparent",
      color: "$grayTextPrimary",
      overflow: "visible",

      "&:hover": {
        borderColor: "$accentBorderHover",
      },

      "&:focus": {
        borderColor: "$accentBorderHover",
        outline: "none",

        "+ label": {
          ...labelActiveStyles,
        },
      },

      transition: "border-color 0.25s ease-out",

      variants: {
        filled: {
          true: {
            "+ label": {
              ...labelActiveStyles,
            },
          },
        },
      },
    })
  );

  return (
    <Container>
      <InputContainer>
        <StyledInput
          {...inputProps}
          ref={ref}
          type={props.type}
          value={props.value}
          onChange={onChange}
          filled={props.value !== ""}
        />
        {label && <Label {...labelProps}>{label}</Label>}
      </InputContainer>
      {props.description && (
        <div {...descriptionProps} style={{ fontSize: 12 }}>
          {props.description}
        </div>
      )}
      {props.errorMessage && (
        <div {...errorMessageProps} style={{ color: "red", fontSize: 12 }}>
          {props.errorMessage}
        </div>
      )}
    </Container>
  );
};
