"use client"

import { AnimatePresence } from "motion/react"

export default function RootTemplate({ children }) {
  return (
    <AnimatePresence>
      {children}
    </AnimatePresence>
  );
}
