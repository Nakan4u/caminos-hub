'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  loginAction,
  registerAction,
  type AuthFormState,
} from '@/lib/actions/auth'
import styles from './AuthForm.module.scss'

interface Props {
  mode: 'login' | 'register'
  locale: string
  callbackUrl?: string
}

export function AuthForm({ mode, locale, callbackUrl }: Props) {
  const t = useTranslations('Auth')
  const action = mode === 'register' ? registerAction : loginAction
  const [state, formAction, pending] = useActionState<AuthFormState | undefined, FormData>(
    action,
    undefined,
  )
  const errors = state?.errors
  const values = state?.values

  return (
    <form action={formAction} className={styles.form} noValidate>
      <input type="hidden" name="locale" value={locale} />
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

      {errors?.form && (
        <p className={styles.formError} role="alert">
          {t(`errors.${errors.form}`)}
        </p>
      )}

      {mode === 'register' && (
        <div className={styles.field}>
          <label className="form-label" htmlFor="auth-name">
            {t('labelName')}
          </label>
          <input
            id="auth-name"
            name="name"
            type="text"
            autoComplete="name"
            className={`form-control ${errors?.name ? 'is-invalid' : ''}`}
            defaultValue={values?.name ?? ''}
          />
          {errors?.name && (
            <div className="invalid-feedback">{t(`errors.${errors.name}`)}</div>
          )}
        </div>
      )}

      <div className={styles.field}>
        <label className="form-label" htmlFor="auth-email">
          {t('labelEmail')}
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`form-control ${errors?.email ? 'is-invalid' : ''}`}
          defaultValue={values?.email ?? ''}
        />
        {errors?.email && (
          <div className="invalid-feedback">{t(`errors.${errors.email}`)}</div>
        )}
      </div>

      <div className={styles.field}>
        <label className="form-label" htmlFor="auth-password">
          {t('labelPassword')}
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          required
          className={`form-control ${errors?.password ? 'is-invalid' : ''}`}
        />
        {errors?.password && (
          <div className="invalid-feedback">{t(`errors.${errors.password}`)}</div>
        )}
      </div>

      <button type="submit" className="btn btn-primary w-100" disabled={pending}>
        {mode === 'register' ? t('registerSubmit') : t('loginSubmit')}
      </button>

      <p className={styles.switch}>
        {mode === 'register' ? (
          <>
            {t('haveAccount')} <Link href="/login">{t('toLogin')}</Link>
          </>
        ) : (
          <>
            {t('noAccount')} <Link href="/register">{t('toRegister')}</Link>
          </>
        )}
      </p>
    </form>
  )
}
