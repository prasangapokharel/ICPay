use std::sync::atomic::{AtomicU32, Ordering};

use tauri::webview::{NewWindowFeatures, NewWindowResponse};
use tauri::{Manager, Url, WebviewUrl};

const LOGIN_URL: &str = "https://icpay.app/login";

static POPUP_COUNTER: AtomicU32 = AtomicU32::new(0);

fn host_allowed(host: &str) -> bool {
    host == "icpay.app"
        || host.ends_with(".icpay.app")
        || host == "www.icpay.app"
        || host.ends_with(".ic0.app")
        || host.ends_with(".icp0.io")
        || host == "id.ai"
        || host.ends_with(".id.ai")
        || host == "identity.ic0.app"
        || host.ends_with(".identity.ic0.app")
        || host == "localhost"
        || host == "127.0.0.1"
}

fn navigation_allowed(url: &Url) -> bool {
    host_allowed(url.host_str().unwrap_or(""))
}

fn open_auth_popup<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    url: Url,
    features: NewWindowFeatures,
) -> NewWindowResponse<R> {
    if !navigation_allowed(&url) {
        return NewWindowResponse::Deny;
    }

    let label = format!("ii-auth-{}", POPUP_COUNTER.fetch_add(1, Ordering::Relaxed));
    let popup_url = WebviewUrl::External(url);

    let builder = tauri::WebviewWindowBuilder::new(app, label, popup_url)
        .title("Internet Identity")
        .resizable(true)
        .center()
        .window_features(features)
        .on_navigation(|nav_url| navigation_allowed(nav_url))
        .on_document_title_changed(|window, title| {
            let _ = window.set_title(&title);
        });

    match builder.build() {
        Ok(window) => NewWindowResponse::Create { window },
        Err(error) => {
            eprintln!("ICPay: failed to open auth window: {error}");
            NewWindowResponse::Deny
        }
    }
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
            let app_handle = app.handle().clone();
            let login = LOGIN_URL
                .parse()
                .expect("icpay login url must be valid");

            tauri::WebviewWindowBuilder::new(app, "main", WebviewUrl::External(login))
                .title("ICPay")
                .inner_size(430.0, 860.0)
                .min_inner_size(390.0, 640.0)
                .resizable(true)
                .center()
                .on_navigation(|url| navigation_allowed(url))
                .on_new_window(move |url, features| open_auth_popup(&app_handle, url, features))
                .build()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running ICPay wallet");
}
