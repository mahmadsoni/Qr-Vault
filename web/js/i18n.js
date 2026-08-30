/* QR Vault — i18n.js
   Full TJ / RU / EN dictionary + translation engine.
   Language is persisted in localStorage under "qrvault_lang".
*/

const I18N = (() => {
  const STORAGE_KEY = "qrvault_lang";
  const DEFAULT_LANG = "tj";

  const dict = {
    tj: {
      app_name: "QR Vault",
      tagline: "Абзорҳои хусусии QR. Содда. Тез.",
      nav_home: "Асосӣ",
      nav_create: "Сохтан",
      nav_scan: "Сканер",
      nav_vault: "Хазина",
      nav_settings: "Танзимот",

      quick_create: "Сохтани QR",
      quick_scan: "Сканкунии QR",
      quick_types: "Навъҳои тезкор",
      recent_items: "Ахирин QR-ҳо",
      vault_stats: "Омори хазина",
      privacy_badge: "Маълумоти QR дар дастгоҳи шумо мемонад",

      type_text: "Матн",
      type_url: "Сомона (URL)",
      type_wifi: "Wi-Fi",
      type_contact: "Контакт",
      type_email: "Почтаи электронӣ",
      type_phone: "Телефон",
      type_sms: "SMS",
      type_location: "Ҷойгиршавӣ",
      type_whatsapp: "WhatsApp",
      type_telegram: "Telegram",

      field_text: "Матни худро нависед",
      field_url: "https://мисол.tj",
      field_wifi_ssid: "Номи шабака (SSID)",
      field_wifi_password: "Рамз",
      field_wifi_security: "Намуди амният",
      field_wifi_hidden: "Шабакаи пинҳонӣ",
      field_contact_name: "Ному насаб",
      field_contact_phone: "Телефон",
      field_contact_email: "Почта",
      field_contact_org: "Ташкилот",
      field_contact_site: "Сомона",
      field_email_to: "Гиранда",
      field_email_subject: "Мавзӯъ",
      field_email_body: "Матн",
      field_phone: "Рақами телефон",
      field_sms_phone: "Рақами телефон",
      field_sms_message: "Паём",
      field_location_lat: "Арз (Latitude)",
      field_location_lng: "Тӯл (Longitude)",
      field_whatsapp_phone: "Рақам бо коди кишвар",
      field_whatsapp_message: "Паём",
      field_telegram_username: "Номи корбар (username)",

      security_wpa: "WPA/WPA2/WPA3",
      security_wep: "WEP",
      security_none: "Бе рамз",

      customize_title: "Танзимоти QR",
      customize_size: "Андоза",
      customize_margin: "Ҳошия",
      customize_fg: "Ранги пеш",
      customize_bg: "Ранги пас",
      customize_ecc: "Дараҷаи ислоҳи хато",
      customize_logo: "Тамғаи марказӣ (ихтиёрӣ)",
      customize_reset: "Аз нав танзим кардан",

      btn_generate: "Сохтан",
      btn_download: "Боргирӣ PNG",
      btn_copy: "Нусхабардорӣ",
      btn_share: "Мубодила",
      btn_save_vault: "Нигоҳ доштан дар Хазина",
      btn_open_url: "Кушодани пайванд",
      btn_scan_again: "Сканкунии дигар",
      btn_clear_all: "Пок кардани ҳама",
      btn_delete: "Нест кардан",
      btn_open: "Кушодан",
      btn_cancel: "Бекор кардан",
      btn_confirm: "Тасдиқ",
      btn_close: "Пӯшидан",
      btn_install: "Насб кардани барнома",
      btn_upload_logo: "Боргирии тамға",
      btn_remove_logo: "Хориҷ кардани тамға",

      scan_title: "Сканери QR",
      scan_start: "Оғози сканер",
      scan_stop: "Қатъ кардани камера",
      scan_result: "Натиҷаи скан",
      scan_no_qr: "QR-код ёфт нашуд. Камераро ба самти QR равона кунед.",
      scan_denied: "Дастрасии камера рад шуд. Дастрасиро дар танзимоти браузер иҷозат диҳед.",
      scan_unavailable: "Камера дастрас нест дар ин дастгоҳ.",
      scan_unsupported: "Браузери шумо камераро дастгирӣ намекунад.",
      scan_invalid: "QR-код нодуруст ё хонда нашуд.",

      vault_title: "Хазинаи QR",
      vault_search: "Ҷустуҷӯ дар хазина...",
      vault_filter_all: "Ҳама",
      vault_filter_fav: "Дӯстдоштаҳо",
      vault_empty: "Хазина холист. QR-ҳои худро нигоҳ доред!",
      vault_created: "Сохта шуд",
      vault_confirm_delete: "Ин QR аз хазина нест карда шавад?",
      vault_confirm_clear: "Тамоми хазина пок карда шавад? Ин амал бебозгашт аст.",

      settings_title: "Танзимот",
      settings_language: "Забон",
      settings_theme: "Мавзӯъ",
      settings_theme_dark: "Торик",
      settings_theme_light: "Равшан",
      settings_theme_system: "Системавӣ",
      settings_clear_vault: "Пок кардани Хазина",
      settings_clear_history: "Пок кардани таърих",
      settings_privacy: "Махфият",
      settings_about: "Дар бораи барнома",
      settings_version: "Версия",
      settings_pwa_info: "Барои насб: тугмаи 'Насб кардан'-ро дар браузер пахш кунед ё аз менюи браузер 'Илова ба экрани асосӣ'-ро интихоб кунед.",

      privacy_statement: "Маълумоти QR-и шумо дар ҳамин дастгоҳ мемонад.",
      privacy_full: "QR Vault ҳељ маълумоти QR-ро ба сервер намефиристад. Ҳама чиз дар дастгоҳи шумо тавассути IndexedDB нигоҳ дошта мешавад. Ягон бақайдгирӣ, пайгирии пинҳонӣ ё бекенд вуҷуд надорад.",

      error_empty_field: "Лутфан ҳамаи майдонҳои ҳатмиро пур кунед.",
      error_invalid_url: "URL нодуруст аст. Бо http:// ё https:// оғоз кунед.",
      error_clipboard: "Дастрасӣ ба ҳофизаи муваққатӣ имконнопазир аст.",
      error_storage: "Хатои дастрасӣ ба ҳофиза.",
      error_generate: "Хатои сохтани QR.",
      error_offline: "Шумо офлайн ҳастед. Баъзе имконот маҳдуданд.",
      error_cdn_blocked: "Дастрасӣ ба китобхонаи QR имконнопазир аст. Шабака/браузери шуморо санҷед (масалан, Brave Shields-ро барои ин сомона хомӯш кунед) ва саҳифаро аз нав бор кунед.",
      toast_copied: "Нусхабардорӣ шуд!",
      toast_saved: "Дар хазина нигоҳ дошта шуд!",
      toast_deleted: "Нест карда шуд.",
      toast_cleared: "Хазина пок карда шуд.",
      toast_downloaded: "Боргирӣ шуд!",
    },

    ru: {
      app_name: "QR Vault",
      tagline: "Приватные QR-инструменты. Просто. Быстро.",
      nav_home: "Главная",
      nav_create: "Создать",
      nav_scan: "Сканер",
      nav_vault: "Хранилище",
      nav_settings: "Настройки",

      quick_create: "Создать QR",
      quick_scan: "Сканировать QR",
      quick_types: "Быстрые типы",
      recent_items: "Недавние QR",
      vault_stats: "Статистика хранилища",
      privacy_badge: "Данные QR остаются на вашем устройстве",

      type_text: "Текст",
      type_url: "Ссылка (URL)",
      type_wifi: "Wi-Fi",
      type_contact: "Контакт",
      type_email: "Электронная почта",
      type_phone: "Телефон",
      type_sms: "SMS",
      type_location: "Местоположение",
      type_whatsapp: "WhatsApp",
      type_telegram: "Telegram",

      field_text: "Введите текст",
      field_url: "https://example.com",
      field_wifi_ssid: "Имя сети (SSID)",
      field_wifi_password: "Пароль",
      field_wifi_security: "Тип безопасности",
      field_wifi_hidden: "Скрытая сеть",
      field_contact_name: "Полное имя",
      field_contact_phone: "Телефон",
      field_contact_email: "Email",
      field_contact_org: "Организация",
      field_contact_site: "Сайт",
      field_email_to: "Получатель",
      field_email_subject: "Тема",
      field_email_body: "Текст",
      field_phone: "Номер телефона",
      field_sms_phone: "Номер телефона",
      field_sms_message: "Сообщение",
      field_location_lat: "Широта (Latitude)",
      field_location_lng: "Долгота (Longitude)",
      field_whatsapp_phone: "Номер с кодом страны",
      field_whatsapp_message: "Сообщение",
      field_telegram_username: "Имя пользователя",

      security_wpa: "WPA/WPA2/WPA3",
      security_wep: "WEP",
      security_none: "Без пароля",

      customize_title: "Настройка QR",
      customize_size: "Размер",
      customize_margin: "Отступ",
      customize_fg: "Цвет переднего плана",
      customize_bg: "Цвет фона",
      customize_ecc: "Уровень коррекции ошибок",
      customize_logo: "Логотип по центру (опционально)",
      customize_reset: "Сбросить настройки",

      btn_generate: "Создать",
      btn_download: "Скачать PNG",
      btn_copy: "Копировать",
      btn_share: "Поделиться",
      btn_save_vault: "Сохранить в Хранилище",
      btn_open_url: "Открыть ссылку",
      btn_scan_again: "Сканировать снова",
      btn_clear_all: "Очистить всё",
      btn_delete: "Удалить",
      btn_open: "Открыть",
      btn_cancel: "Отмена",
      btn_confirm: "Подтвердить",
      btn_close: "Закрыть",
      btn_install: "Установить приложение",
      btn_upload_logo: "Загрузить логотип",
      btn_remove_logo: "Удалить логотип",

      scan_title: "Сканер QR",
      scan_start: "Начать сканирование",
      scan_stop: "Остановить камеру",
      scan_result: "Результат сканирования",
      scan_no_qr: "QR-код не найден. Наведите камеру на код.",
      scan_denied: "Доступ к камере отклонён. Разрешите доступ в настройках браузера.",
      scan_unavailable: "Камера недоступна на этом устройстве.",
      scan_unsupported: "Ваш браузер не поддерживает камеру.",
      scan_invalid: "QR-код некорректен или не читается.",

      vault_title: "Хранилище QR",
      vault_search: "Поиск в хранилище...",
      vault_filter_all: "Все",
      vault_filter_fav: "Избранное",
      vault_empty: "Хранилище пусто. Сохраните свои QR-коды!",
      vault_created: "Создано",
      vault_confirm_delete: "Удалить этот QR из хранилища?",
      vault_confirm_clear: "Очистить всё хранилище? Это действие необратимо.",

      settings_title: "Настройки",
      settings_language: "Язык",
      settings_theme: "Тема",
      settings_theme_dark: "Тёмная",
      settings_theme_light: "Светлая",
      settings_theme_system: "Системная",
      settings_clear_vault: "Очистить хранилище",
      settings_clear_history: "Очистить историю",
      settings_privacy: "Конфиденциальность",
      settings_about: "О приложении",
      settings_version: "Версия",
      settings_pwa_info: "Для установки нажмите кнопку 'Установить' в браузере или выберите 'Добавить на главный экран' в меню браузера.",

      privacy_statement: "Ваши данные QR остаются на этом устройстве.",
      privacy_full: "QR Vault никогда не отправляет данные QR на сервер. Всё хранится на вашем устройстве через IndexedDB. Нет регистрации, скрытого отслеживания или бэкенда.",

      error_empty_field: "Пожалуйста, заполните все обязательные поля.",
      error_invalid_url: "Неверный URL. Начните с http:// или https://.",
      error_clipboard: "Доступ к буферу обмена недоступен.",
      error_storage: "Ошибка доступа к хранилищу.",
      error_generate: "Ошибка создания QR.",
      error_offline: "Вы офлайн. Некоторые функции ограничены.",
      error_cdn_blocked: "Не удалось загрузить библиотеку QR. Проверьте сеть/браузер (например, отключите Brave Shields для этого сайта) и перезагрузите страницу.",
      toast_copied: "Скопировано!",
      toast_saved: "Сохранено в хранилище!",
      toast_deleted: "Удалено.",
      toast_cleared: "Хранилище очищено.",
      toast_downloaded: "Скачано!",
    },

    en: {
      app_name: "QR Vault",
      tagline: "Private QR Tools. Simple. Fast.",
      nav_home: "Home",
      nav_create: "Create",
      nav_scan: "Scan",
      nav_vault: "Vault",
      nav_settings: "Settings",

      quick_create: "Create QR",
      quick_scan: "Scan QR",
      quick_types: "Quick types",
      recent_items: "Recent QR items",
      vault_stats: "Vault statistics",
      privacy_badge: "Your QR data stays on this device",

      type_text: "Text",
      type_url: "URL",
      type_wifi: "Wi-Fi",
      type_contact: "Contact",
      type_email: "Email",
      type_phone: "Phone",
      type_sms: "SMS",
      type_location: "Location",
      type_whatsapp: "WhatsApp",
      type_telegram: "Telegram",

      field_text: "Enter your text",
      field_url: "https://example.com",
      field_wifi_ssid: "Network name (SSID)",
      field_wifi_password: "Password",
      field_wifi_security: "Security type",
      field_wifi_hidden: "Hidden network",
      field_contact_name: "Full name",
      field_contact_phone: "Phone",
      field_contact_email: "Email",
      field_contact_org: "Organization",
      field_contact_site: "Website",
      field_email_to: "Recipient",
      field_email_subject: "Subject",
      field_email_body: "Body",
      field_phone: "Phone number",
      field_sms_phone: "Phone number",
      field_sms_message: "Message",
      field_location_lat: "Latitude",
      field_location_lng: "Longitude",
      field_whatsapp_phone: "Number with country code",
      field_whatsapp_message: "Message",
      field_telegram_username: "Username",

      security_wpa: "WPA/WPA2/WPA3",
      security_wep: "WEP",
      security_none: "No password",

      customize_title: "QR Customization",
      customize_size: "Size",
      customize_margin: "Margin",
      customize_fg: "Foreground color",
      customize_bg: "Background color",
      customize_ecc: "Error correction level",
      customize_logo: "Center logo (optional)",
      customize_reset: "Reset customization",

      btn_generate: "Generate",
      btn_download: "Download PNG",
      btn_copy: "Copy",
      btn_share: "Share",
      btn_save_vault: "Save to Vault",
      btn_open_url: "Open link",
      btn_scan_again: "Scan again",
      btn_clear_all: "Clear all",
      btn_delete: "Delete",
      btn_open: "Open",
      btn_cancel: "Cancel",
      btn_confirm: "Confirm",
      btn_close: "Close",
      btn_install: "Install app",
      btn_upload_logo: "Upload logo",
      btn_remove_logo: "Remove logo",

      scan_title: "QR Scanner",
      scan_start: "Start scanner",
      scan_stop: "Stop camera",
      scan_result: "Scan result",
      scan_no_qr: "No QR code detected. Point the camera at a code.",
      scan_denied: "Camera access denied. Please allow access in your browser settings.",
      scan_unavailable: "Camera is not available on this device.",
      scan_unsupported: "Your browser does not support camera access.",
      scan_invalid: "Invalid or unreadable QR code.",

      vault_title: "QR Vault",
      vault_search: "Search vault...",
      vault_filter_all: "All",
      vault_filter_fav: "Favorites",
      vault_empty: "Your vault is empty. Save some QR codes!",
      vault_created: "Created",
      vault_confirm_delete: "Delete this QR from the vault?",
      vault_confirm_clear: "Clear the entire vault? This cannot be undone.",

      settings_title: "Settings",
      settings_language: "Language",
      settings_theme: "Theme",
      settings_theme_dark: "Dark",
      settings_theme_light: "Light",
      settings_theme_system: "System",
      settings_clear_vault: "Clear Vault",
      settings_clear_history: "Clear history",
      settings_privacy: "Privacy",
      settings_about: "About",
      settings_version: "Version",
      settings_pwa_info: "To install, tap 'Install' in your browser or choose 'Add to Home Screen' from the browser menu.",

      privacy_statement: "Your QR data stays on this device.",
      privacy_full: "QR Vault never sends QR data to a server. Everything is stored on your device via IndexedDB. There is no account, hidden tracking, or backend.",

      error_empty_field: "Please fill in all required fields.",
      error_invalid_url: "Invalid URL. Start with http:// or https://.",
      error_clipboard: "Clipboard access is unavailable.",
      error_storage: "Storage access error.",
      error_generate: "Failed to generate QR code.",
      error_offline: "You are offline. Some features are limited.",
      error_cdn_blocked: "Could not load the QR library. Check your network/browser (e.g. turn off Brave Shields for this site) and reload the page.",
      toast_copied: "Copied!",
      toast_saved: "Saved to vault!",
      toast_deleted: "Deleted.",
      toast_cleared: "Vault cleared.",
      toast_downloaded: "Downloaded!",
    },
  };

  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  if (!dict[currentLang]) currentLang = DEFAULT_LANG;

  function t(key) {
    return (dict[currentLang] && dict[currentLang][key]) || dict[DEFAULT_LANG][key] || key;
  }

  function setLang(lang) {
    if (!dict[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations();
    document.documentElement.setAttribute("lang", lang);
  }

  function getLang() {
    return currentLang;
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(key));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      el.setAttribute("aria-label", t(key));
    });
  }

  return { t, setLang, getLang, applyTranslations, DEFAULT_LANG };
})();
