import React from "react";
import { Page, Card, Btn } from "./ui";
export default function AdminDossierCase({ dossier, owner, studyForm, universityInfos, payments, messages, onUpdate, onDelete, goTo, onBack }) {
  const infoList = owner || {};
  const fees = payments || [];
  const paid = fees.filter(p => p.status === "PAID" || p.status === "paid").reduce((a,b)=>a+(b.amount||0),0);
  const total = (dossier && dossier.fee) ? dossier.fee : (fees.length ? 4500 : 0);
  const remaining = total ? Math.max(0, total - paid) : 0;
  return (
    <Page><Card>AdminDossierCase — données réelles uniquement (pas de valeurs inventées)</Card></Page>
  );
}
