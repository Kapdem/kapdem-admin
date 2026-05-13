import LoginPage from "@/components/Login/LoginPage";
import React, { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div />}>
      <LoginPage />
    </Suspense>
  );
}
