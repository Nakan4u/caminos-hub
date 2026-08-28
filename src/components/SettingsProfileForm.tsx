'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import {
  removeAvatarAction,
  updateAvatarAction,
  updateNameAction,
  type AccountFormState,
} from '@/lib/actions/account'
import { Avatar } from './Avatar'
import styles from './SettingsForm.module.scss'

interface Props {
  locale: string
  name: string | null
  email: string
  image: string | null
}

type State = AccountFormState | undefined

export function SettingsProfileForm({ locale, name, email, image }: Props) {
  const t = useTranslations('Settings')

  const [nameState, nameAction, namePending] = useActionState<State, FormData>(
    updateNameAction,
    undefined,
  )
  const [avatarState, avatarAction, avatarPending] = useActionState<State, FormData>(
    updateAvatarAction,
    undefined,
  )
  const [removeState, removeAction, removePending] = useActionState<State, FormData>(
    removeAvatarAction,
    undefined,
  )

  const msg = (state: State, key: string) =>
    state?.errors?.[key] ? t(`errors.${state.errors[key]}`) : null

  return (
    <section className={styles.block}>
      <h2 className={styles.blockHeading}>{t('profileHeading')}</h2>
      <p className={styles.blockLede}>{t('profileLede')}</p>

      <form action={avatarAction} className={styles.form}>
        <input type="hidden" name="locale" value={locale} />
        <div className={styles.avatarRow}>
          <Avatar src={image} name={name} email={email} size={56} />
          <div className={`${styles.field} ${styles.avatarField}`}>
            <label className="form-label" htmlFor="settings-avatar">
              {t('avatarLabel')}
            </label>
            <input
              id="settings-avatar"
              name="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className={`form-control ${avatarState?.errors?.avatar ? 'is-invalid' : ''}`}
            />
            <p className={styles.hint}>{t('avatarHint')}</p>
            {msg(avatarState, 'avatar') && (
              <div className="invalid-feedback d-block">{msg(avatarState, 'avatar')}</div>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          <button type="submit" className="btn btn-primary" disabled={avatarPending}>
            {t('avatarSubmit')}
          </button>
          <button
            type="submit"
            className="btn btn-outline-secondary"
            formAction={removeAction}
            disabled={removePending}
          >
            {t('avatarRemove')}
          </button>
          {avatarState?.ok && <span className={styles.status}>{t('avatarSaved')}</span>}
          {removeState?.ok && <span className={styles.status}>{t('avatarRemoved')}</span>}
        </div>
        {(msg(avatarState, 'form') || msg(removeState, 'form')) && (
          <p className={styles.formError} role="alert">
            {msg(avatarState, 'form') ?? msg(removeState, 'form')}
          </p>
        )}
      </form>

      <form action={nameAction} className={styles.form}>
        <input type="hidden" name="locale" value={locale} />
        <div className={styles.field}>
          <label className="form-label" htmlFor="settings-name">
            {t('nameLabel')}
          </label>
          <input
            id="settings-name"
            name="name"
            type="text"
            autoComplete="name"
            defaultValue={name ?? ''}
            className={`form-control ${nameState?.errors?.name ? 'is-invalid' : ''}`}
          />
          <p className={styles.hint}>{t('nameHint')}</p>
          {msg(nameState, 'name') && (
            <div className="invalid-feedback d-block">{msg(nameState, 'name')}</div>
          )}
        </div>
        <div className={styles.actions}>
          <button type="submit" className="btn btn-primary" disabled={namePending}>
            {t('nameSubmit')}
          </button>
          {nameState?.ok && <span className={styles.status}>{t('nameSaved')}</span>}
        </div>
        {msg(nameState, 'form') && (
          <p className={styles.formError} role="alert">
            {msg(nameState, 'form')}
          </p>
        )}
      </form>
    </section>
  )
}
