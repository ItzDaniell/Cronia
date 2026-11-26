import { useEffect, useState, type ReactNode } from 'react';
import { Moon, Sun, Trash2 } from 'lucide-react';
import type { AccentTone, BackupInfo, IconName, UserSettings } from '@/types';
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
  onResetAllData: () => void;
  onNotify: (message: string) => void;
}

const SETTINGS_TABS: [string, IconName][] = [
  ['General', 'settings'],
  ['Notificaciones', 'bell'],
  ['Apariencia', 'palette'],
  ['Calendario', 'calendar'],
  ['Atajos globales', 'bolt'],
  ['Copia y restauración', 'folder'],
  ['Privacidad', 'info'],
];

const ACCENT_COLORS: AccentTone[] = ['violet', 'blue', 'cyan', 'green', 'orange', 'red'];

export function SettingsPage({
  settings,
  backups,
  onUpdateSettings,
  onCreateBackup,
  onRestoreBackup,
  onResetAllData,
  onNotify,
}: SettingsPageProps) {
  const [tab, setTab] = useState('General');
  const [draftName, setDraftName] = useState(settings.userName);

  useEffect(() => {
    setDraftName(settings.userName);
  }, [settings.userName]);

  const handleSaveChanges = () => {
    const clean = draftName.trim();
    if (!clean) {
      onNotify('El nombre de usuario no puede estar vacío');
      setDraftName(settings.userName);
      return;
    }
    if (clean !== settings.userName) {
      onUpdateSettings({ userName: clean });
    }
    onNotify('Preferencias guardadas correctamente');
  };

  const sw = (key: keyof UserSettings) => (
    <Switch
      checked={Boolean(settings[key])}
      onCheckedChange={(checked) => onUpdateSettings({ [key]: checked })}
    />
  );

  const contents: Record<string, ReactNode> = {
    General: (
      <>
        <SettingRow title="Nombre de usuario" desc="Se muestra en el saludo del Dashboard y tu perfil">
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
        <SettingRow title="Iniciar con Windows" desc="Abrir Cronia automáticamente al iniciar sesión">
          {sw('launchOnStartup')}
        </SettingRow>
        <SettingRow title="Minimizar a la bandeja" desc="Mantener Cronia activo al cerrar la ventana">
          {sw('minimizeToTray')}
        </SettingRow>
        <SettingRow title="Idioma" desc="Idioma utilizado en toda la interfaz">
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
    Notificaciones: (
      <>
        <SettingRow title="Notificaciones nativas" desc="Usar el Centro de actividades de Windows">
          {sw('nativeNotifications')}
        </SettingRow>
        <SettingRow title="Sonido" desc="Reproducir un sonido al mostrar una alerta">
          {sw('soundEnabled')}
        </SettingRow>
      </>
    ),
    Apariencia: (
      <>
        <SettingRow title="Tema" desc="Selecciona el aspecto de la aplicación">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!settings.dark ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateSettings({ dark: false })}
            >
              <Sun className="h-4 w-4" />
              Claro
            </Button>
            <Button
              type="button"
              variant={settings.dark ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdateSettings({ dark: true })}
            >
              <Moon className="h-4 w-4" />
              Oscuro
            </Button>
          </div>
        </SettingRow>
        <SettingRow title="Color de acento" desc="Personaliza el color principal de Cronia en vivo">
          <div className="colors">
            {ACCENT_COLORS.map((color) => (
              <button
                type="button"
                className={color}
                onClick={() => {
                  onUpdateSettings({ accent: color });
                  onNotify(`Color de acento actualizado`);
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
    Calendario: (
      <>
        <SettingRow title="Primer día de la semana" desc="Aplicado a todas las vistas">
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
              <SelectItem value="Lunes">Lunes</SelectItem>
              <SelectItem value="Domingo">Domingo</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </>
    ),
    'Atajos globales': (
      <>
        <SettingRow title="Buscar rápidamente" desc="Enfoca la barra de búsqueda superior">
          <kbd className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
            Ctrl + K
          </kbd>
        </SettingRow>
        <SettingRow title="Cerrar búsqueda" desc="Limpia el filtro actual">
          <kbd className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
            Esc
          </kbd>
        </SettingRow>
      </>
    ),
    'Copia y restauración': (
      <>
        <SettingRow title="Copia automática" desc="Crear una copia local cada 24 horas">
          {sw('autoBackup')}
        </SettingRow>
        <SettingRow title="Crear copia ahora" desc="Genera un snapshot completo de la base de datos SQLite">
          <Button type="button" variant="outline" size="sm" onClick={onCreateBackup}>
            Crear copia
          </Button>
        </SettingRow>
        {backups.length > 0 && (
          <div className="pt-2">
            {backups.slice(0, 5).map((b) => (
              <SettingRow
                key={b.fileName}
                title={b.fileName}
                desc={`${Math.max(1, Math.round(b.sizeBytes / 1024))} KB`}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRestoreBackup(b.fileName)}
                >
                  Restaurar
                </Button>
              </SettingRow>
            ))}
          </div>
        )}
      </>
    ),
    Privacidad: (
      <>
        <SettingRow title="Datos locales" desc="Tus tareas se guardan únicamente en este dispositivo">
          <span className="rounded-lg bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500">
            Protegidos
          </span>
        </SettingRow>
        <SettingRow title="Diagnósticos anónimos" desc="Nunca incluye contenido de tareas">
          {sw('diagnostics')}
        </SettingRow>
        <SettingRow title="Restablecer datos locales" desc="Borra todos los datos guardados y deja Cronia vacío">
          <Button type="button" variant="destructive" size="sm" onClick={onResetAllData}>
            <Trash2 className="h-3.5 w-3.5" />
            Restablecer
          </Button>
        </SettingRow>
      </>
    ),
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <Card className="h-fit p-2 lg:col-span-3">
        <div className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {SETTINGS_TABS.map(([name, icon]) => (
            <button
              type="button"
              key={name}
              onClick={() => setTab(name)}
              className={`flex h-10 shrink-0 items-center gap-2.5 rounded-xl px-3 text-[13px] font-medium transition-colors lg:w-full ${
                tab === name
                  ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
              }`}
            >
              <Icon name={icon} size={16} />
              <span className="whitespace-nowrap">{name}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-9">
        <CardHeader>
          <div>
            <CardTitle>{tab}</CardTitle>
            <CardDescription>Preferencias de {tab.toLowerCase()}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="py-2">{contents[tab]}</CardContent>
        <div className="flex justify-end border-t border-[var(--line)] px-5 py-4">
          <Button type="button" onClick={handleSaveChanges}>
            Guardar cambios
          </Button>
        </div>
      </Card>
    </div>
  );
}
