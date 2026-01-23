"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { MediaType } from "@/lib/types";

interface FilterComboboxProps {
  value: MediaType | "ALL";
  onChange: (value: MediaType | "ALL") => void;
}

const options: { value: MediaType | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tout" },
  { value: "TRACK", label: "Titres" },
  { value: "ALBUM", label: "Albums" },
  { value: "ARTIST", label: "Artistes" },
];

export function FilterCombobox({ value, onChange }: FilterComboboxProps) {
  return (
    <Combobox
      items={options}
      value={options.find((o) => o.value === value)}
      onValueChange={(val) => {
        if (val) onChange(val.value);
      }}
      itemToStringValue={(item) => item.label}
    >
      <ComboboxInput className="min-w-35" placeholder="Filtrer..." />
      <ComboboxContent>
        <ComboboxEmpty>Aucun filtre disponible</ComboboxEmpty>
        <ComboboxList>
          {(option) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
