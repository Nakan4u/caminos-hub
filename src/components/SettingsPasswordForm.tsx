'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import {
  changePasswordAction,
  type AccountFormState,
} from '@/lib/actions/account'
import styles from './SettingsForm.module.scss'

export function SettingsPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations('Settings')
  const [state, formAction, pending] = useActionState<
    AccountFormState | undefined,
    FormData
  >(changePasswordAction, undefined)

  const msg = (key: string) =>
    state?.errors?.[key] ? t(`errors.${state.errors[key]}`) : null

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="locale" value={locale} />

      {msg('form') && (
        <p className={styles.formError} role="alert">
          {msg('form')}
        </p>
      )}

      <div className={styles.field}>
        <label className="form-label" htmlFor="settings-current-password">
          {t('currentPasswordLabel')}
        </label>
        <input
          id="settings-current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={`form-control ${state?.errors?.currentPassword ? 'is-invalid' : ''}`}
        />
        {msg('currentPassword') && (
          <div className="invalid-feedback d-block">{msg('currentPassword')}</div>
        )}
      </div>

      <div className={styles.field}>
        <label className="form-label" htmlFor="settings-new-password">
          {t('newPasswordLabel')}
        </label>
        <input
          id="settings-new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          className={`form-control ${state?.errors?.newPassword ? 'is-invalid' : ''}`}
        />
        {msg('newPassword') && (
          <div className="invalid-feedback d-block">{msg('newPassword')}</div>
        )}
      </div>

      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {t('passwordSubmit')}
        </button>
        {state?.ok && <span className={styles.status}>{t('passwordSaved')}</span>}
      </div>
    </form>
  )
}
