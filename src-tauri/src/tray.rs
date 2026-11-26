use tauri::{
  AppHandle, Manager,
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
  let show_item = MenuItem::with_id(app, "show", "Abrir Cronia", true, None::<&str>)?;
  let quit_item = MenuItem::with_id(app, "quit", "Salir", true, None::<&str>)?;
  let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

  let mut builder = TrayIconBuilder::with_id("cronia-tray")
    .menu(&menu)
    .tooltip("Cronia - Productividad Personal")
    .show_menu_on_left_click(false)
    .on_menu_event(|app, event| match event.id.as_ref() {
      "show" => restore_main_window(app),
      "quit" => app.exit(0),
      _ => {}
    })
    .on_tray_icon_event(|tray, event| {
      if let TrayIconEvent::Click {
        button: MouseButton::Left,
        button_state: MouseButtonState::Up,
        ..
      } = event
      {
        restore_main_window(tray.app_handle());
      }
    });

  if let Some(icon) = app.default_window_icon().cloned() {
    builder = builder.icon(icon);
  }

  builder.build(app)?;
  Ok(())
}

pub fn restore_main_window(app: &AppHandle) {
  if let Some(window) = app.get_webview_window("main") {
    let _ = window.show();
    let _ = window.unminimize();
    let _ = window.set_focus();
  }
}
