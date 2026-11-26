import { useEffect, useState, type ReactNode } from 'react';
import { Moon, Sun, Trash2 } from 'lucide-react';
import type { AccentTone, BackupInfo, IconName, UserSettings } from '@/types';
import { useI18n } from '@/i18n';
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingRow } from '@/components/ui/SettingRow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsPageProps {
  settings: UserSettings;
  backups: BackupInfo[];
  onUpdateSettings: (partial: Partial<UserSettings>) => void;
  onCreateBackup: () => void;
  onRestoreBackup: (fileName: string) => void;
  onDeleteBackup: (fileName: string) => void;
  onResetAllData: () => void;
  onNotify: (message: string) => void;
}

type TabId =
  | 'general'
  | 'notifications'
  | 'appearance'
  | 'calendar'
  | 'shortcuts'
  | 'backup'
  | 'privacy';

const ACCENT_COLORS: AccentTone[] = ['violet', 'blue', 'cyan', 'green', 'orange', 'red'];

export function SettingsPage({
  settings,
  backups,
  onUpdateSettings,
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup,
  onResetAllData,
  onNotify,
}: SettingsPageProps) {
  const { tr } = useI18n();
  const [tab, setTab] = useState<TabId>('general');
  const [draftName, setDraftName] = useState(settings.userName);

  useEffect(() => {
    setDraftName(settings.userName);
  }, [settings.userName]);

  const handleSaveChanges = () => {
    const clean = draftName.trim();
    if (!clean) {
      onNotify(tr('El nombre de usuario no puede estar vacío', 'Username cannot be empty'));
      setDraftName(settings.userName);
      return;
    }
    if (clean !== settings.userName) {
      onUpdateSettings({ userName: clean });
    }
    onNotify(tr('Preferencias guardadas correctamente', 'Preferences saved successfully'));
  };

  const tabs: { id: TabId; label: string; icon: IconName }[] = [
    { id: 'general', label: tr('General', 'General'), icon: 'settings' },
    { id: 'notifications', label: tr('Notificaciones', 'Notifications'), icon: 'bell' },
    { id: 'appearance', label: tr('Apariencia', 'Appearance'), icon: 'palette' },
    { id: 'calendar', label: tr('Calendario', 'Calendar'), icon: 'calendar' },
    { id: 'shortcuts', label: tr('Atajos globales', 'Shortcuts'), icon: 'bolt' },
    { id: 'backup', label: tr('Copia y restauración', 'Backup & Restore'), icon: 'folder' },
    { id: 'privacy', label: tr('Privacidad', 'Privacy'), icon: 'info' },
  ];

  const activeTabMeta = tabs.find((item) => item.id === tab) ?? tabs[0];

  const sw = (key: keyof UserSettings) => (
    <Switch
      checked={Boolean(settings[key])}
      onCheckedChange={(checked) => onUpdateSettings({ [key]: checked })}
    />
  );

  const contents: Record<TabId, ReactNode> = {
    general: (
      <>
        <SettingRow
          title={tr('Nombre de usuario', 'Username')}
          desc={tr('Se muestra en el saludo del Dashboard y tu perfil', 'Shown in the Dashboard greeting and your profile')}
        >
          <Input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveChanges();
              }
            }}
            className="w-[220px]"
          />
        </SettingRow>
        <SettingRow
          title={tr('Iniciar con Windows', 'Launch on startup')}
          desc={tr('Abrir Cronia automáticamente al iniciar sesión', 'Automatically open Cronia when you sign in')}
        >
          {sw('launchOnStartup')}
        </SettingRow>
        <SettingRow
          title={tr('Minimizar a la bandeja', 'Minimize to tray')}
          desc={tr('Mantener Cronia activo al cerrar la ventana', 'Keep Cronia running in the system tray on close')}
        >
          {sw('minimizeToTray')}
        </SettingRow>
        <SettingRow
          title={tr('Idioma', 'Language')}
          desc={tr('Idioma utilizado en toda la interfaz', 'Language used across the entire interface')}
        >
          <Select
            value={settings.language}
            onValueChange={(v) => onUpdateSettings({ language: v as UserSettings['language'] })}
          >
            <SelectTrigger className="w-[155px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Español">Español</SelectItem>
              <SelectItem value="English">English</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </>
    ),
    notifications: (
      <>
        <SettingRow
          title={tr('Notificaciones nativas', 'Native notifications')}
          desc={tr('Usar el Centro de actividades de Windows', 'Use the Windows Action Center for alerts')}
        >
          {sw('nativeNotifications')}
        </SettingRow>
        <SettingRow
          title={tr('Sonido', 'Sound')}
          desc={tr('Reproducir un sonido al mostrar una alerta', 'Play an alert sound when notifications fire')}
        >
          {sw('soundEnabled')}
        </SettingRow>
      </>
    ),
    appearance: (
      <>
        <SettingRow
          title={tr('Tema', 'Theme')}
          desc={tr('Selecciona el aspecto de la aplicación', 'Choose the application appearance')}
        >
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!settings.dark ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateSettings({ dark: false })}
            >
              <Sun className="h-4 w-4" />
              {tr('Claro', 'Light')}
            </Button>
            <Button
              type="button"
              variant={settings.dark ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateSettings({ dark: true })}
            >
              <Moon className="h-4 w-4" />
              {tr('Oscuro', 'Dark')}
            </Button>
          </div>
        </SettingRow>
        <SettingRow
          title={tr('Color de acento', 'Accent color')}
          desc={tr('Personaliza el color principal de Cronia en vivo', 'Customize Cronia’s primary accent color live')}
        >
          <div className="colors">
            {ACCENT_COLORS.map((color) => (
              <button
                type="button"
                className={color}
                onClick={() => {
                  onUpdateSettings({ accent: color });
                  onNotify(tr('Color de acento actualizado', 'Accent color updated'));
                }}
                key={color}
                aria-label={`Color ${color}`}
                style={{
                  outline: settings.accent === color ? '2px solid var(--text)' : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </SettingRow>
      </>
    ),
    calendar: (
      <>
        <SettingRow
          title={tr('Primer día de la semana', 'First day of week')}
          desc={tr('Aplicado a todas las vistas', 'Applied across all calendar views')}
        >
          <Select
            value={settings.firstDayOfWeek}
            onValueChange={(v) =>
              onUpdateSettings({ firstDayOfWeek: v as UserSettings['firstDayOfWeek'] })
            }
          >
            <SelectTrigger className="w-[155px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lunes">{tr('Lunes', 'Monday')}</SelectItem>
              <SelectItem value="Domingo">{tr('Domingo', 'Sunday')}</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </>
    ),
    shortcuts: (
      <>
        <SettingRow
          title={tr('Buscar rápidamente', 'Quick search')}
          desc={tr('Enfoca la barra de búsqueda superior', 'Focus the top command search bar')}
        >
          <kbd className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
            Ctrl + K
          </kbd>
        </SettingRow>
        <SettingRow
          title={tr('Cerrar búsqueda', 'Clear search')}
          desc={tr('Limpia el filtro actual', 'Clears the active search query')}
        >
          <kbd className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
            Esc
          </kbd>
        </SettingRow>
      </>
    ),
    backup: (
      <>
        <SettingRow
          title={tr('Copia automática', 'Automatic backup')}
          desc={tr('Crear una copia cada 24 horas', 'Create an automatic snapshot every 24 hours')}
        >
          {sw('autoBackup')}
        </SettingRow>
        <SettingRow
          title={tr('Crear copia ahora', 'Create backup now')}
          desc={tr('Genera un snapshot completo de tu base de datos', 'Generates a full SQLite database snapshot')}
        >
          <Button type="button" variant="outline" size="sm" onClick={onCreateBackup}>
            {tr('Crear copia', 'Create backup')}
          </Button>
        </SettingRow>
        {backups.length > 0 && (
          <div className="pt-2">
            {backups.map((b) => (
              <SettingRow
                key={b.fileName}
                title={b.fileName}
                desc={`${Math.max(1, Math.round(b.sizeBytes / 1024))} KB`}
              >
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRestoreBackup(b.fileName)}
                  >
                    {tr('Restaurar', 'Restore')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[var(--muted)] hover:text-rose-500"
                    onClick={() => onDeleteBackup(b.fileName)}
                    title={tr('Eliminar copia', 'Delete backup')}
                    aria-label={tr(`Eliminar ${b.fileName}`, `Delete ${b.fileName}`)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </SettingRow>
            ))}
          </div>
        )}
      </>
    ),
    privacy: (
      <>
        <SettingRow
          title={tr('Datos en tu equipo', 'On-device data')}
          desc={tr('Tus tareas se guardan únicamente en este dispositivo', 'Your data stays strictly on this device')}
        >
          <span className="rounded-lg bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500">
            {tr('Protegidos', 'Protected')}
          </span>
        </SettingRow>
        <SettingRow
          title={tr('Diagnósticos anónimos', 'Anonymous diagnostics')}
          desc={tr('Nunca incluye contenido de tareas', 'Never includes task contents')}
        >
          {sw('diagnostics')}
        </SettingRow>
        <SettingRow
          title={tr('Restablecer datos', 'Reset all data')}
          desc={tr('Borra todos los datos guardados y deja Cronia vacío', 'Erases all saved records and resets Cronia')}
        >
          <Button type="button" variant="destructive" size="sm" onClick={onResetAllData}>
            <Trash2 className="h-3.5 w-3.5" />
            {tr('Restablecer', 'Reset')}
          </Button>
        </SettingRow>
      </>
    ),
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <Card className="h-fit p-2 lg:col-span-3">
        <div className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {tabs.map(({ id, label, icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setTab(id)}
              className={`flex h-10 shrink-0 items-center gap-2.5 rounded-xl px-3 text-[13px] font-medium transition-colors lg:w-full ${
                tab === id
                  ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
              }`}
            >
              <Icon name={icon} size={16} />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-9">
        <CardHeader>
          <div>
            <CardTitle>{activeTabMeta.label}</CardTitle>
            <CardDescription>
              {tr(
                `Preferencias de ${activeTabMeta.label.toLowerCase()}`,
                `${activeTabMeta.label} preferences`,
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="py-2">{contents[tab]}</CardContent>
        <div className="flex justify-end border-t border-[var(--line)] px-5 py-4">
          <Button type="button" onClick={handleSaveChanges}>
            {tr('Guardar cambios', 'Save changes')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
