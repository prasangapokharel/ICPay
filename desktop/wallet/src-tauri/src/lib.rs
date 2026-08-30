use tauri::{Manager, WebviewUrl};

const LOGIN_URL: &str = "https://icpay.app/login";

fn host_allowed(host: &str) -> bool {
    host == "icpay.app"
        || host.ends_with(".icpay.app")
        || host.ends_with(".ic0.app")
        || host.ends_with(".icp0.io")
        || host == "id.ai"
        || host.ends_with(".id.ai")
        || host == "identity.ic0.app"
        || host.ends_with(".identity.ic0.app")
        || host == "localhost"
        || host == "127.0.0.1"
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            let login = LOGIN_URL
                .parse()
                .expect("icpay login url must be valid");

            tauri::WebviewWindowBuilder::new(app, "main", WebviewUrl::External(login))
                .title("ICPay")
                .inner_size(430.0, 860.0)
                .min_inner_size(390.0, 640.0)
                .resizable(true)
                .center()
                .on_navigation(|url| host_allowed(url.host_str().unwrap_or("")))
                .build()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running ICPay wallet");
}
