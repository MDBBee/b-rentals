"use client";

import { useFormState } from "react-dom";
import { RefObject, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { actionFunction } from "@/utils/types";

const initialState = {
  message: "",
};

function FormContainer({
  action,
  children,
}: {
  action: actionFunction;
  children: React.ReactNode;
}) {
  const [state, formAction] = useFormState(action, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && state.message.includes("!")) {
      toast({ description: state.message, variant: "destructive" });
    } else if (state.message) {
      toast({ description: state.message });
    }
    (formRef.current as HTMLFormElement | null)?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction}>
      {children}
    </form>
  );
}

export default FormContainer;
