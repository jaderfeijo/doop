import { useEffect, useState } from 'react'
import { useT } from '../lib/i18n'
import { canChooseServer, serverHost, serverStatus, type ServerStatus } from '../lib/desktopServer'
import { ServerModal } from './ServerSettings'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { CardDescription, CardHeader, CardRow, CardTitle, SettingsCard } from './ui/card'

/* Settings → General's Server card in the desktop app: which Doop server
   this window opened, and the sign-in screen's modal to change it. Browsers
   and shells that cannot switch never draw it. */
export function ServerCard() {
  if (!canChooseServer()) return null
  return <ServerCardBody />
}

function ServerCardBody() {
  const t = useT()
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let live = true
    serverStatus()
      .then((current) => live && setStatus(current))
      /* the modal says why when it is opened; the card just shows no host */
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  return (
    <SettingsCard>
      <CardHeader>
        <CardTitle>{t('settings.serverTitle')}</CardTitle>
        <CardDescription>{t('settings.serverDescription')}</CardDescription>
      </CardHeader>
      <CardRow
        label={t('settings.serverRow')}
        action={<Button onClick={() => setOpen(true)}>{t('settings.serverChange')}</Button>}
      >
        {status && (
          <span className="flex items-center gap-2 text-body text-ink-soft">
            <span className="font-mono">{serverHost(status.url)}</span>
            {!status.custom && <Badge>{t('settings.serverDefault')}</Badge>}
          </span>
        )}
      </CardRow>
      {open && <ServerModal onClose={() => setOpen(false)} />}
    </SettingsCard>
  )
}
