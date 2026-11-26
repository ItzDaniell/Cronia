import { useState, type ReactNode } from 'react';
import type { AccentTone, BackupInfo, IconName, UserSettings } from '../types';
import { Icon } from '../components/ui/Icon';
import { PanelHeading } from '../components/ui/PanelHeading';
import { SettingRow } from '../components/ui/SettingRow';

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

const ACCENT_COLORS: AccentTone[] = ['violet', 'blue', 'green', 'orange', 'red'];

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

  const sw = (key: keyof UserSettings) => (
    <button
      type="button"
      className={`switch ${settings[key] ? 'on' : ''}`}
      onClick={() => onUpdateSettings({ [key]: !settings[key] })}
    >
      <i />
    </button>
  );

  const contents: Record<string, ReactNode> = {
    General: (
      <>
        <SettingRow title="Nombre de usuario" desc="Se muestra en el saludo del Dashboard y tu perfil local">
          <input
            value={settings.userName}
            onChange={(e) => onUpdateSettings({ userName: e.target.value })}
            style={{ width: 180 }}
          />
        </SettingRow>
        <SettingRow title="Iniciar con Windows" desc="Abrir Cronia automáticamente al iniciar sesión">
          {sw('launchOnStartup')}
        </SettingRow>
        <SettingRow title="Minimizar a la bandeja" desc="Mantener Cronia activo al cerrar la ventana">
          {sw('minimizeToTray')}
        </SettingRow>
        <SettingRow title="Idioma" desc="Idioma utilizado en toda la interfaz">
          <select
            value={settings.language}
            onChange={(e) => onUpdateSettings({ language: e.target.value as UserSettings['language'] })}
          >
            <option value="Español">Español</option>
            <option value="English">English</option>
          </select>
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
          <div className="theme-options">
            <button
              type="button"
              className={!settings.dark ? 'active' : ''}
              onClick={() => onUpdateSettings({ dark: false })}
            >
              <Icon name="sun" />
              Claro
            </button>
            <button
              type="button"
              className={settings.dark ? 'active' : ''}
              onClick={() => onUpdateSettings({ dark: true })}
            >
              <Icon name="moon" />
              Oscuro
            </button>
          </div>
        </SettingRow>
        <SettingRow title="Color de acento" desc="Color principal de Cronia">
          <div className="colors">
            {ACCENT_COLORS.map((color) => (
              <button
                type="button"
                className={color}
                onClick={() => {
                  onUpdateSettings({ accent: color });
                  onNotify(`Color ${color} seleccionado`);
                }}
                key={color}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        </SettingRow>
      </>
    ),
    Calendario: (
      <>
        <SettingRow title="Primer día de la semana" desc="Aplicado a todas las vistas">
          <select
            value={settings.firstDayOfWeek}
            onChange={(e) => onUpdateSettings({ firstDayOfWeek: e.target.value as UserSettings['firstDayOfWeek'] })}
          >
            <option value="Lunes">Lunes</option>
            <option value="Domingo">Domingo</option>
          </select>
        </SettingRow>
      </>
    ),
    'Atajos globales': (
      <>
        <SettingRow title="Buscar rápidamente" desc="Enfoca la barra de búsqueda superior">
          <kbd>Ctrl + K</kbd>
        </SettingRow>
        <SettingRow title="Cerrar búsqueda" desc="Limpia el filtro actual">
          <kbd>Esc</kbd>
        </SettingRow>
      </>
    ),
    'Copia y restauración': (
      <>
        <SettingRow title="Copia automática" desc="Crear una copia local cada 24 horas">
          {sw('autoBackup')}
        </SettingRow>
        <SettingRow title="Crear copia ahora" desc="Genera un snapshot completo de la base de datos SQLite">
          <button type="button" className="setting-action" onClick={onCreateBackup}>
            Crear copia
          </button>
        </SettingRow>
        {backups.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {backups.slice(0, 5).map((b) => (
              <SettingRow
                key={b.fileName}
                title={b.fileName}
                desc={`${Math.max(1, Math.round(b.sizeBytes / 1024))} KB`}
              >
                <button
                  type="button"
                  className="setting-action"
                  onClick={() => onRestoreBackup(b.fileName)}
                >
                  Restaurar
                </button>
              </SettingRow>
            ))}
          </div>
        )}
      </>
    ),
    Privacidad: (
      <>
        <SettingRow title="Datos locales" desc="Tus tareas se guardan únicamente en este dispositivo">
          <span className="status-good">Protegidos</span>
        </SettingRow>
        <SettingRow title="Diagnósticos anónimos" desc="Nunca incluye contenido de tareas">
          {sw('diagnostics')}
        </SettingRow>
        <SettingRow title="Restablecer datos locales" desc="Borra todos los datos guardados y deja Cronia vacío">
          <button type="button" className="delete-action" onClick={onResetAllData}>
            <Icon name="trash" />
            Restablecer
          </button>
        </SettingRow>
      </>
    ),
  };

  return (
    <div className="settings-layout">
      <aside className="panel settings-nav">
        {SETTINGS_TABS.map(([name, icon]) => (
          <button type="button" className={tab === name ? 'active' : ''} onClick={() => setTab(name)} key={name}>
            <Icon name={icon} />
            {name}
          </button>
        ))}
      </aside>

      <section className="panel settings-main">
        <PanelHeading title={tab} subtitle={`Preferencias de ${tab.toLowerCase()}`} />
        <div className="settings-group" key={tab}>
          <h3>{tab.toUpperCase()}</h3>
          {contents[tab]}
        </div>
        <div className="settings-actions">
          <button type="button" onClick={() => onNotify('Preferencias guardadas correctamente')}>
            Guardar cambios
          </button>
        </div>
      </section>
    </div>
  );
}
