'use client'

import { useActionState, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  deleteAccountAction,
  type AccountFormState,
} from '@/lib/actions/account'
import styles from './SettingsForm.module.scss'

interface Props {
  locale: string
  email: string
}

export function SettingsDeleteForm({ locale, email }: Props) {
  const t = useTranslations('Settings')
  const [state, formAction, pending] = useActionState<
    AccountFormState | undefined,
    FormData
  >(deleteAccountAction, undefined)
  const [typed, setTyped] = useState('')

  const armed = typed.trim().toLowerCase() === email.toLowerCase()
  const msg = (key: string) =>
    state?.errors?.[key] ? t(`errors.${state.errors[key]}`) : null

  return (
    <section className={styles.dangerZone}>
      <h2 className={styles.dangerHeading}>{t('dangerHeading')}</h2>
      <p className={styles.blockLede}>{t('dangerLede')}</p>

      <form action={formAction} className={styles.form}>
        <input type="hidden" name="locale" value={locale} />

        {msg('form') && (
          <p className={styles.formError} role="alert">
            {msg('form')}
          </p>
        )}

        <div className={styles.field}>
          <label className="form-label" htmlFor="settings-confirm-email">
            {t('confirmEmailLabel')}
          </label>
          <input
            id="settings-confirm-email"
            name="confirmEmail"
            type="email"
            autoComplete="off"
            placeholder={email}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className={`form-control ${state?.errors?.confirmEmail ? 'is-invalid' : ''}`}
          />
          {msg('confirmEmail') && (
            <div className="invalid-feedback d-block">{msg('confirmEmail')}</div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className="btn btn-danger"
            disabled={!armed || pending}
          >
            {t('deleteSubmit')}
          </button>
        </div>
      </form>
    </section>
  )
}
