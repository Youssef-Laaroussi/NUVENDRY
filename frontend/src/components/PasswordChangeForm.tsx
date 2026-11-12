import { useState, type FormEvent } from 'react';
import { api } from '../api/client';

export function PasswordChangeForm() {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean }>();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (saving) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const password = String(values.get('newPassword'));
    if (password !== values.get('confirmPassword')) {
      setFeedback({ message: 'The new passwords do not match.', error: true });
      return;
    }
    setSaving(true);
    setFeedback(undefined);
    try {
      await api.changePassword(String(values.get('currentPassword')), password);
      form.reset();
      setFeedback({ message: 'Password updated.', error: false });
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : 'Unable to update your password.', error: true });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-2 text-xs">
      <fieldset disabled={saving} className="space-y-2">
        {[
          ['currentPassword', 'Current password', 'current-password', 1],
          ['newPassword', 'New password', 'new-password', 8],
          ['confirmPassword', 'Confirm new password', 'new-password', 8],
        ].map(([name, label, autocomplete, minLength]) => (
          <label className="block font-semibold" key={name}>
            {label}
            <input name={String(name)} required type="password" autoComplete={String(autocomplete)}
              minLength={Number(minLength)} maxLength={72} className="block w-full rounded-lg border border-[#E5E7E0] p-2 font-normal" />
          </label>
        ))}
        <button type="submit" className="rounded-lg bg-[#0E6636] px-3 py-2 text-xs font-semibold text-white">
          {saving ? 'Saving…' : 'Change Password'}
        </button>
      </fieldset>
      {feedback && <p role={feedback.error ? 'alert' : 'status'}>{feedback.message}</p>}
    </form>
  );
}
