"use client";
import { useState } from "react";
import { Button, Dialog } from "./ui";

/** Keeps the pending action in memory until the person explicitly discards the current response. */
export function useDiscardConfirmation() {
  const [pending,setPending]=useState<(()=>void)|null>(null);
  const requestChange=(hasResponse:boolean,change:()=>void)=>{
    if(hasResponse)setPending(()=>change);
    else change();
  };
  const confirmation=<Dialog title="Deixar esta resposta?" open={pending!==null} onClose={()=>setPending(null)}>
    <p>Sua resposta está somente nesta tela. Ao continuar, ela será descartada.</p>
    <div className="fv-actions"><Button secondary onClick={()=>setPending(null)}>Continuar nesta resposta</Button><Button onClick={()=>{pending?.();setPending(null);}}>Continuar e descartar resposta</Button></div>
  </Dialog>;
  return {requestChange,confirmation};
}
