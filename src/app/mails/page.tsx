import React from "react";
import { getMailsData } from "@/lib/editors/data";
import AgGridMails from "./AgGridMails";

export default async function page() {
  const mail = await getMailsData();
  // API'den dizi geliyorsa doğrudan, obje geliyorsa içindeki ilk dizi alınır
  let mails: any[] = [];
  if (Array.isArray(mail)) {
    mails = mail;
  } else if (mail && typeof mail === "object") {
    for (const key in mail) {
      if (Array.isArray(mail[key])) {
        mails = mail[key];
        break;
      }
    }
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gelen Mailler</h1>
      <AgGridMails mails={mails} />
    </div>
  );
}
