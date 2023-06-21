import { Popover, PopoverContent } from "@ui/popover";
import {
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  Command,
} from "@ui/command";
import { useState } from "react";
import { Frequency, RRule } from "rrule";

/**
 * To use this component, make sure you wrap it around a PopoverTrigger component.
 * To activate the FrequencyPopover component from within a Context Menu or Dropdown Menu, you must encase the Context Menu or Dropdown Menu component on the FrequencyPopover component.
 */
export function FrequencyPopover({
  setFrequency,
  children,
}: {
  setFrequency: (frequency: Frequency) => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const freqs = [RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {children}
      <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
        <Command>
          <CommandInput placeholder="Change frequency..." />
          <CommandList
            onSelect={() => {
              setOpen(false);
            }}
          >
            <CommandGroup>
              {freqs.map((freq, i) => (
                <CommandItem
                  key={i}
                  onSelect={() => {
                    setFrequency(freq);
                    setOpen(false);
                  }}
                >
                  {FrequencyToTxt(freq)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function FrequencyToTxt(frequency: Frequency | null) {
  switch (frequency) {
    case RRule.DAILY:
      return "Every day";
    case RRule.WEEKLY:
      return "Every week";
    case RRule.MONTHLY:
      return "Every month";
    case RRule.YEARLY:
      return "Every year";
  }
}
