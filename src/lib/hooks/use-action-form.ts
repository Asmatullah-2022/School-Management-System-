"use client";

import { useState, useTransition, type FormEvent } from "react";

/**
 * Root-cause fix for the form-reset-on-error bug: `<form action={fn}>`
 * (React's native form-action prop) resets every uncontrolled field as
 * soon as `fn` returns — and since `fn` here just kicks off `startTransition`
 * and returns immediately (not the awaited promise), React considers the
 * action "done" and resets the form well before the server actually
 * responds. On success this is invisible because the page redirects away;
 * on a validation/DB error the fields are already wiped by the time the
 * error message appears, so it looks like the error cleared the form.
 *
 * The fix is to never hand a function to `action` — bind the server call to
 * a plain `onSubmit` handler instead, `preventDefault()`, and read the
 * fields from `e.currentTarget` ourselves. Neither the browser's native
 * reset-on-submit nor React's action-reset behavior can fire once the
 * event's default has been prevented, so every field the user typed stays
 * exactly as they left it until a real success actually navigates away.
 */
export function useActionForm<T extends { error?: string } | void>(
  action: (formData: FormData) => Promise<T>
) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await action(formData);
      if (res && "error" in res && res.error) setError(res.error);
    });
  }

  return { error, setError, pending, handleSubmit };
}
