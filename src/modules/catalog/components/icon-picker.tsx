"use client";

import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import { useState, useRef } from "react";

import {
  CATEGORY_ICON_LIST,
  CATEGORY_ICON_MAP,
  CategoryIconDisplay,
} from "../utils/category-icons";

type IconPickerProps = {
  value: string | null;
  onChange: (key: string) => void;
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Trigger: botón con el ícono actual */}
      <Tooltip title="Cambiar ícono">
        <Box
          ref={anchorRef}
          onClick={() => setOpen(true)}
          sx={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            border: "1.5px solid",
            borderColor: open ? "#2563eb" : "#e2e8f0",
            bgcolor: open ? "#eff6ff" : "#f8fafc",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.15s",
            "&:hover": { borderColor: "#94a3b8", bgcolor: "#f1f5f9" },
          }}
        >
          <CategoryIconDisplay
            iconKey={value}
            sx={{ fontSize: 22, color: "#475569" }}
          />
        </Box>
      </Tooltip>

      {/* Popover con la grilla de iconos */}
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: { borderRadius: 2, p: 1.5, mt: 0.5, boxShadow: 4 },
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 0.5,
            width: 224,
          }}
        >
          {CATEGORY_ICON_LIST.map((key) => {
            const Icon = CATEGORY_ICON_MAP[key];
            const selected = value === key;
            return (
              <Tooltip key={key} title={key} placement="top">
                <Box
                  onClick={() => { onChange(key); setOpen(false); }}
                  sx={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1.5,
                    cursor: "pointer",
                    bgcolor: selected ? "#dbeafe" : "transparent",
                    color: selected ? "#1d4ed8" : "#475569",
                    "&:hover": { bgcolor: selected ? "#dbeafe" : "#f1f5f9" },
                    transition: "background 0.1s",
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Popover>
    </>
  );
}
