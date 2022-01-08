import { Check, ChevronsUpDown } from "lucide-react";

import { styled } from "@root/stitches.config";
import { StyledButton } from "./Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuTrigger,
} from "./DropdownMenu";

const Trigger = styled(StyledButton, {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "default",
});

const SelectContent = styled(DropdownMenuContent, {
  minWidth: "160px",
});

type Props = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export const Select: React.FC<Props> = ({ options, value, onChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Trigger>
          {value} <ChevronsUpDown size={14} />
        </Trigger>
      </DropdownMenuTrigger>

      <SelectContent sideOffset={5}>
        {options.map((option) => {
          return (
            <DropdownMenuCheckboxItem
              key={option}
              checked={option === value}
              onSelect={() => onChange(option)}
            >
              <DropdownMenuItemIndicator>
                <Check size={14} />
              </DropdownMenuItemIndicator>
              {option}
            </DropdownMenuCheckboxItem>
          );
        })}
      </SelectContent>
    </DropdownMenu>
  );
};
