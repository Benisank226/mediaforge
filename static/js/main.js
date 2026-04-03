// ═══════════════════════════════════════════════════
//   MEDIAFORGE — Main JS v2.1
//   Features: Queue persistence, cancel, full i18n, toast, drag&drop, theme toggle, PWA
// ═══════════════════════════════════════════════════

const socket = io();

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const ICONS = {
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  convert:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  video:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
  audio:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  gif:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/><line x1="10" y1="9" x2="14" y2="9"/></svg>`,
  subtitle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h4m4 0h2M7 11h2m4 0h4"/></svg>`,
  image:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  check:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  info:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  warning:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  inbox:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  clock:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  user:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  eye:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  loader:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
  youtube:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>`,
  tiktok:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 8.6a5.5 5.5 0 0 1-3.3-1V15a5 5 0 1 1-4.3-4.9V12a2.8 2.8 0 1 0 2.1 2.7V3h2.2a5.5 5.5 0 0 0 3.3 4.4v1.2z"/></svg>`,
};

// ─── i18n SYSTEM ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  fr: {
    nav_home: 'Accueil', nav_convert: 'Convertir', nav_editor: 'Éditeur MP3',
    nav_subtitles: 'Sous-titres', nav_gif: 'GIF Maker', nav_history: 'Historique',
    nav_settings: 'Paramètres',
    settings_title: 'Paramètres', settings_lang: 'Langue / Language',
    settings_download: 'Téléchargement', settings_quality: 'Qualité par défaut',
    settings_quality_sub: 'Format vidéo prioritaire', settings_audio_mp3: 'Forcer MP3',
    settings_audio_mp3_sub: "Convertir l'audio en MP3 192kbps", settings_thumbnail: 'Miniature automatique',
    settings_thumbnail_sub: 'Télécharger la thumbnail aussi', settings_ui: 'Interface',
    settings_animations: 'Animations', settings_animations_sub: 'Effets visuels et transitions',
    settings_notifications: 'Notifications toast', settings_notifications_sub: 'Alertes de succès et erreurs',
    settings_theme: 'Thème sombre / clair', settings_theme_sub: 'Changer l\'apparence',
    settings_install: 'Application', settings_install_sub: 'Installer ou ouvrir MediaForge',
    settings_update: 'Mise à jour', settings_update_sub: 'Nouvelle version disponible',
    settings_about: 'À propos', settings_powered: 'Propulsé par',
    footer_powered: 'Propulsé par', footer_built: 'Construit avec ❤️ sur Termux',
    footer_version: 'Version 2.1',
    footer_license: 'MIT License',
    hero_badge: 'Plateforme multimédia 2026',
    hero_title: 'Télécharge. Convertis.<br/><span>Forge tes médias.</span>',
    hero_desc: 'YouTube, TikTok, Instagram, X et +1000 sites. Conversion vidéo, audio, images. GIF, sous-titres, éditeur MP3 — tout en un.',
    btn_analyze: 'Analyser', btn_download: 'Télécharger', btn_save: 'Sauvegarder',
    downloading: 'Téléchargement en cours…',
    audio_only: 'Audio uniquement (MP3)',
    auto_thumbnail: 'Miniature aussi',
    batch_title: 'Téléchargement par lot',
    batch_desc: 'Une URL par ligne — max 10',
    batch_download: 'Tout télécharger',
    clear: 'Vider',
    queue_title: "File d'attente",
    queue_clear: 'Vider',
    features_title: 'Toutes les fonctionnalités',
    features_sub: 'Un studio multimédia complet dans ton navigateur',
    convert_desc: 'Vidéo, audio, images — tous formats supportés',
    editor_desc: 'Modifie titre, artiste, album, cover',
    subtitles_desc: 'Extrait les sous-titres en .srt ou .vtt',
    gif_desc: 'Crée des GIFs parfaits depuis n\'importe quelle vidéo',
    thumb_title: 'Miniatures',
    thumb_desc: 'Télécharge la thumbnail HD de n\'importe quelle vidéo',
    compress_title: 'Compression',
    compress_desc: 'Réduis la taille de tes images avec contrôle qualité',
    convert_title: 'Convertisseur',
    convert_title_span: 'universel',
    convert_sub: 'Vidéo, audio, images — glisse ton fichier et choisis le format cible',
    video_drop_title: 'Glisse ta vidéo ici',
    video_drop_desc: 'ou clique pour choisir — MP4, MKV, AVI, MOV, WEBM, FLV…',
    output_format: 'Format de sortie',
    quality: 'Qualité',
    btn_convert: 'Convertir',
    converting: 'Conversion en cours…',
    audio_drop_title: 'Glisse ton fichier audio',
    audio_drop_desc: 'MP3, WAV, FLAC, OGG, AAC, M4A…',
    img_drop_title: 'Glisse ton image',
    img_drop_desc: 'JPG, PNG, WEBP, AVIF, BMP, TIFF…',
    btn_compress_convert: 'Convertir / Compresser',
    merge_desc: 'Fusionne une piste audio sur une vidéo existante',
    video_source: 'Vidéo (MP4, MKV…)',
    audio_source: 'Audio (MP3, WAV…)',
    merge_option: 'Option de synchronisation',
    merge_shortest: 'Couper à la plus courte',
    merge_loop: 'Boucler l\'audio',
    merge_pad: 'Ajouter du silence (si audio plus court)',
    btn_merge: 'Fusionner',
    compress_tab_desc: 'Compresse tes images avec un curseur de qualité intuitif',
    compress_drop_title: 'Glisse ton image',
    compress_drop_desc: 'JPG, PNG, WEBP…',
    btn_compress: 'Compresser',
    editor_title: 'Éditeur',
    editor_title_span: 'MP3 / ID3',
    editor_sub: 'Modifie le titre, l\'artiste, l\'album, le genre et la couverture de tes fichiers audio',
    step1: '① Charge ton fichier audio',
    step2: '② Édite les métadonnées',
    step3: '③ Sauvegarde',
    btn_save_tags: 'Sauvegarder les tags',
    btn_reset: 'Réinitialiser',
    current_tags: 'Tags actuels détectés :',
    tips_title: 'Conseils',
    tip1: '🏷️ Les tags ID3 sont intégrés directement dans le fichier MP3',
    tip2: '🎨 Les lecteurs comme Spotify, iTunes lisent ces métadonnées automatiquement',
    tip3: '📱 Parfait pour organiser ta bibliothèque musicale locale',
    subtitles_title: 'Sous-titres &',
    subtitles_sub: 'Extrait les sous-titres d\'une vidéo YouTube en .SRT ou .VTT, et télécharge les thumbnails HD',
    include_auto: 'Inclure sous-titres automatiques',
    include_manual: 'Inclure sous-titres manuels',
    sub_info: 'ℹ️ Les sous-titres automatiques (générés par YouTube) sont aussi récupérés si les sous-titres manuels ne sont pas disponibles.',
    btn_extract: 'Extraire les sous-titres',
    extracting: 'Extraction des sous-titres…',
    sub_help_title: 'Comment utiliser les .SRT',
    sub_help1: '🎬 VLC Media Player — Sous-titres → Ajouter un fichier de sous-titres',
    sub_help2: '🌐 Sites web — Format VTT recommandé pour les balises HTML5 video',
    sub_help3: '✏️ Édition — Ouvre le .SRT dans n\'importe quel éditeur de texte',
    thumb_info: '🖼️ Télécharge la miniature en qualité maximale disponible (jusqu\'à 1280×720 sur YouTube)',
    btn_download_thumb: 'Télécharger la miniature',
    preview: 'Aperçu :',
    gif_maker: 'Maker',
    gif_desc_page: 'Crée des GIFs animés parfaits depuis n\'importe quelle vidéo — palette optimisée FFmpeg',
    gif_drop_title: 'Glisse ta vidéo ici',
    gif_drop_desc: 'MP4, MKV, AVI, MOV, WEBM…',
    gif_params: 'Paramètres du GIF',
    btn_create_gif: 'Créer le GIF',
    btn_download_gif: 'Télécharger le GIF',
    btn_cancel: 'Annuler',
    gif_generating: 'Génération du GIF…',
    gif_tips_title: 'Conseils pour un GIF parfait',
    tip_duration: '⏱️ Durée idéale : 3 à 8 secondes pour un GIF fluide et léger',
    tip_width: '📐 Largeur recommandée : 480px pour web, 320px pour mobile',
    tip_palette: '🎨 Palette 256 couleurs générée intelligemment par FFmpeg',
    tip_fps: '🐢 FPS bas (8-12) = fichier léger. FPS élevé (20+) = animation fluide',
    tip_start: '🔪 Commence précisément : note la seconde exacte de ta séquence préférée',
    tip_share: '📱 Partage : compatible Discord, Telegram, WhatsApp, Twitter et plus',
    history_title: 'Mon',
    history_title_span: 'Historique',
    history_sub: 'Retrouve tous tes téléchargements et conversions récents',
    recent_activity: 'Activité récente',
    loading: 'Chargement…',
    export_json: 'Exporter JSON',
    clear_all: 'Tout effacer',
    stats_title: 'Statistiques',
    total_ops: 'Opérations totales',
    total_dl: 'Téléchargements',
    total_conv: 'Conversions',
    total_gif: 'GIFs créés',
    footer_donate: 'Faire un don',
donate_title: 'Soutenir',
donate_title_span: 'MediaForge',
donate_sub: 'Votre soutien permet d’améliorer l’application, d’ajouter de nouvelles fonctionnalités et de maintenir les serveurs.',
donate_paypal_desc: 'Paiement sécurisé par carte ou compte PayPal.',
donate_paypal_btn: 'Donner via PayPal',
donate_kofi_desc: 'Soutenez avec un café virtuel, sans commission.',
donate_kofi_btn: 'Offrir un café',
donate_github_desc: 'Devenez sponsor sur GitHub pour un soutien récurrent.',
donate_github_btn: 'Sponsoriser sur GitHub',
donate_crypto_desc: 'Bitcoin, Ethereum, etc. (adresses disponibles sur demande).',
donate_crypto_btn: 'Voir les adresses',
donate_thanks_title: 'Merci pour votre soutien !',
donate_thanks_desc: 'Chaque don, même modeste, contribue à rendre MediaForge meilleur. Votre nom sera mentionné dans les crédits si vous le souhaitez.',
donate_why_title: 'Pourquoi faire un don ?',
donate_why_server: 'Hébergement et bande passante',
donate_why_dev: 'Développement de nouvelles fonctionnalités',
donate_why_support: 'Support technique et maintenance',
donate_unavailable: 'Indisponible pour le moment',
donate_paypal_powered: 'Optimisé par ',
donate_crypto_note: 'Les fonds sont reversés directement sur mon compte Binance. Merci pour votre générosité !',
crypto_badge:       'Donations sécurisées',
trust_secure:       'Transactions sécurisées',
trust_chain:        'Vérifiables sur la blockchain',
trust_multi:        '5 cryptos acceptées',
binance_badge:      'Compte Binance vérifié · Toutes adresses actives',
copy_address:       'Copier l\'adresse',
crypto_title:       'Dons en',
crypto_title_span:  'cryptomonnaies',
crypto_sub:         'Soutenez MediaForge avec Bitcoin, Ethereum, USDT, BNB et plus. Les fonds sont reversés directement sur mon compte Binance.',
crypto_note_title:  'Transactions 100 % sécurisées',
crypto_note:        'Toutes ces adresses pointent vers mon compte Binance vérifié. Chaque transaction est immuable et vérifiable sur la blockchain. Merci du fond du cœur pour votre soutien — il fait vraiment la différence !',
crypto_back:        '← Retour aux dons',
  },
  en: {
    nav_home: 'Home', nav_convert: 'Convert', nav_editor: 'MP3 Editor',
    nav_subtitles: 'Subtitles', nav_gif: 'GIF Maker', nav_history: 'History',
    nav_settings: 'Settings',
    settings_title: 'Settings', settings_lang: 'Language',
    settings_download: 'Download', settings_quality: 'Default quality',
    settings_quality_sub: 'Video format priority', settings_audio_mp3: 'Force MP3',
    settings_audio_mp3_sub: 'Convert audio to MP3 192kbps', settings_thumbnail: 'Auto thumbnail',
    settings_thumbnail_sub: 'Download thumbnail too', settings_ui: 'Interface',
    settings_animations: 'Animations', settings_animations_sub: 'Visual effects and transitions',
    settings_notifications: 'Toast notifications', settings_notifications_sub: 'Success and error alerts',
    settings_theme: 'Dark / Light theme', settings_theme_sub: 'Change appearance',
    settings_install: 'Application', settings_install_sub: 'Install or open MediaForge',
    settings_update: 'Update', settings_update_sub: 'New version available',
    settings_about: 'About', settings_powered: 'Powered by',
    footer_powered: 'Powered by', footer_built: 'Built with ❤️ on Termux',
    footer_version: 'Version 2.1',
    footer_license: 'MIT License',
    hero_badge: 'Multimedia platform 2026',
    hero_title: 'Download. Convert.<br/><span>Forge your media.</span>',
    hero_desc: 'YouTube, TikTok, Instagram, X and +1000 sites. Video, audio, image conversion. GIF, subtitles, MP3 editor — all in one.',
    btn_analyze: 'Analyze', btn_download: 'Download', btn_save: 'Save',
    downloading: 'Downloading…',
    audio_only: 'Audio only (MP3)',
    auto_thumbnail: 'Thumbnail too',
    batch_title: 'Batch download',
    batch_desc: 'One URL per line — max 10',
    batch_download: 'Download all',
    clear: 'Clear',
    queue_title: 'Queue',
    queue_clear: 'Clear',
    features_title: 'All features',
    features_sub: 'A complete media studio in your browser',
    convert_desc: 'Video, audio, images — all formats supported',
    editor_desc: 'Edit title, artist, album, cover',
    subtitles_desc: 'Extract subtitles as .srt or .vtt',
    gif_desc: 'Create perfect GIFs from any video',
    thumb_title: 'Thumbnails',
    thumb_desc: 'Download HD thumbnail from any video',
    compress_title: 'Compression',
    compress_desc: 'Reduce image size with quality control',
    convert_title: 'Converter',
    convert_title_span: 'universal',
    convert_sub: 'Video, audio, images — drag your file and choose target format',
    video_drop_title: 'Drag your video here',
    video_drop_desc: 'or click to choose — MP4, MKV, AVI, MOV, WEBM, FLV…',
    output_format: 'Output format',
    quality: 'Quality',
    btn_convert: 'Convert',
    converting: 'Converting…',
    audio_drop_title: 'Drag your audio file here',
    audio_drop_desc: 'MP3, WAV, FLAC, OGG, AAC, M4A…',
    img_drop_title: 'Drag your image here',
    img_drop_desc: 'JPG, PNG, WEBP, AVIF, BMP, TIFF…',
    btn_compress_convert: 'Convert / Compress',
    merge_desc: 'Merge an audio track onto an existing video',
    video_source: 'Video (MP4, MKV…)',
    audio_source: 'Audio (MP3, WAV…)',
    merge_option: 'Sync option',
    merge_shortest: 'Trim to shortest',
    merge_loop: 'Loop audio',
    merge_pad: 'Pad with silence',
    btn_merge: 'Merge',
    compress_tab_desc: 'Compress your images with an intuitive quality slider',
    compress_drop_title: 'Drag your image here',
    compress_drop_desc: 'JPG, PNG, WEBP…',
    btn_compress: 'Compress',
    editor_title: 'Editor',
    editor_title_span: 'MP3 / ID3',
    editor_sub: 'Edit title, artist, album, genre and cover of your audio files',
    step1: '① Load your audio file',
    step2: '② Edit metadata',
    step3: '③ Save',
    btn_save_tags: 'Save tags',
    btn_reset: 'Reset',
    current_tags: 'Current tags detected:',
    tips_title: 'Tips',
    tip1: '🏷️ ID3 tags are embedded directly in the MP3 file',
    tip2: '🎨 Players like Spotify, iTunes read these metadata automatically',
    tip3: '📱 Perfect for organizing your local music library',
    subtitles_title: 'Subtitles &',
    subtitles_sub: 'Extract YouTube video subtitles as .SRT or .VTT, and download HD thumbnails',
    include_auto: 'Include auto-generated subtitles',
    include_manual: 'Include manual subtitles',
    sub_info: 'ℹ️ Auto-generated subtitles are also retrieved if manual subtitles are not available.',
    btn_extract: 'Extract subtitles',
    extracting: 'Extracting subtitles…',
    sub_help_title: 'How to use .SRT',
    sub_help1: '🎬 VLC Media Player — Subtitles → Add subtitle file',
    sub_help2: '🌐 Websites — VTT format recommended for HTML5 video tags',
    sub_help3: '✏️ Editing — Open .SRT in any text editor',
    thumb_info: '🖼️ Download the thumbnail in maximum available quality (up to 1280×720 on YouTube)',
    btn_download_thumb: 'Download thumbnail',
    preview: 'Preview:',
    gif_maker: 'Maker',
    gif_desc_page: 'Create perfect animated GIFs from any video — FFmpeg optimized palette',
    gif_drop_title: 'Drag your video here',
    gif_drop_desc: 'MP4, MKV, AVI, MOV, WEBM…',
    gif_params: 'GIF settings',
    btn_create_gif: 'Create GIF',
    btn_download_gif: 'Download GIF',
    btn_cancel: 'Cancel',
    gif_generating: 'Generating GIF…',
    gif_tips_title: 'Tips for perfect GIF',
    tip_duration: '⏱️ Ideal duration: 3 to 8 seconds for smooth and light GIF',
    tip_width: '📐 Recommended width: 480px for web, 320px for mobile',
    tip_palette: '🎨 256-color palette intelligently generated by FFmpeg',
    tip_fps: '🐢 Low FPS (8-12) = lightweight file. High FPS (20+) = smooth animation',
    tip_start: '🔪 Start precisely: note the exact second of your favorite sequence',
    tip_share: '📱 Share: compatible with Discord, Telegram, WhatsApp, Twitter and more',
    history_title: 'My',
    history_title_span: 'History',
    history_sub: 'Find all your recent downloads and conversions',
    recent_activity: 'Recent activity',
    loading: 'Loading…',
    export_json: 'Export JSON',
    clear_all: 'Clear all',
    stats_title: 'Statistics',
    total_ops: 'Total operations',
    total_dl: 'Downloads',
    total_conv: 'Conversions',
    total_gif: 'GIFs created',
    footer_donate: 'Donate',
donate_title: 'Support',
donate_title_span: 'MediaForge',
donate_sub: 'Your support helps improve the app, add new features, and keep servers running.',
donate_paypal_desc: 'Secure payment by card or PayPal account.',
donate_paypal_btn: 'Donate via PayPal',
donate_kofi_desc: 'Support with a virtual coffee, no fees.',
donate_kofi_btn: 'Buy me a coffee',
donate_github_desc: 'Become a sponsor on GitHub for recurring support.',
donate_github_btn: 'Sponsor on GitHub',
donate_crypto_desc: 'Bitcoin, Ethereum, etc. (addresses available upon request).',
donate_crypto_btn: 'View addresses',
donate_thanks_title: 'Thank you for your support!',
donate_thanks_desc: 'Every donation, no matter how small, helps make MediaForge better. Your name will be mentioned in the credits if you wish.',
donate_why_title: 'Why donate?',
donate_why_server: 'Hosting and bandwidth',
donate_why_dev: 'Development of new features',
donate_why_support: 'Technical support and maintenance',
donate_unavailable: 'Currently unavailable',
donate_paypal_powered: 'Powered by ',
donate_crypto_note: 'Funds go directly to my Binance account. Thank you for your generosity!',
crypto_badge:       'Secure donations',
trust_secure:       'Secure transactions',
trust_chain:        'Verifiable on the blockchain',
trust_multi:        '5 cryptos accepted',
binance_badge:      'Verified Binance account · All addresses active',
copy_address:       'Copy address',
crypto_title:       'Donate in',
crypto_title_span:  'cryptocurrency',
crypto_sub:         'Support MediaForge with Bitcoin, Ethereum, USDT, BNB and more. Funds go directly to my Binance account.',
crypto_note_title:  '100% secure transactions',
crypto_note:        'All these addresses point to my verified Binance account. Every transaction is immutable and verifiable on the blockchain. Thank you so much for your support — it truly makes a difference!',
crypto_back:        '← Back to donations',
  },
  es: {
    nav_home: 'Inicio', nav_convert: 'Convertir', nav_editor: 'Editor MP3',
    nav_subtitles: 'Subtítulos', nav_gif: 'Creador de GIF', nav_history: 'Historial',
    nav_settings: 'Ajustes',
    settings_title: 'Ajustes', settings_lang: 'Idioma',
    settings_download: 'Descarga', settings_quality: 'Calidad predeterminada',
    settings_quality_sub: 'Formato de vídeo prioritario', settings_audio_mp3: 'Forzar MP3',
    settings_audio_mp3_sub: 'Convertir audio a MP3 192kbps', settings_thumbnail: 'Miniatura automática',
    settings_thumbnail_sub: 'Descargar miniatura también', settings_ui: 'Interfaz',
    settings_animations: 'Animaciones', settings_animations_sub: 'Efectos visuales y transiciones',
    settings_notifications: 'Notificaciones', settings_notifications_sub: 'Alertas de éxito y error',
    settings_theme: 'Tema oscuro / claro', settings_theme_sub: 'Cambiar apariencia',
    settings_install: 'Aplicación', settings_install_sub: 'Instalar o abrir MediaForge',
    settings_update: 'Actualización', settings_update_sub: 'Nueva versión disponible',
    settings_about: 'Acerca de', settings_powered: 'Impulsado por',
    footer_powered: 'Impulsado por', footer_built: 'Construido con ❤️ en Termux',
    footer_version: 'Versión 2.1',
    footer_license: 'Licencia MIT',
    hero_badge: 'Plataforma multimedia 2026',
    hero_title: 'Descarga. Convierte.<br/><span>Forja tus medios.</span>',
    hero_desc: 'YouTube, TikTok, Instagram, X y +1000 sitios. Conversión de vídeo, audio, imágenes. GIF, subtítulos, editor MP3 — todo en uno.',
    btn_analyze: 'Analizar', btn_download: 'Descargar', btn_save: 'Guardar',
    downloading: 'Descargando…',
    audio_only: 'Solo audio (MP3)',
    auto_thumbnail: 'Miniatura también',
    batch_title: 'Descarga por lotes',
    batch_desc: 'Una URL por línea — máximo 10',
    batch_download: 'Descargar todo',
    clear: 'Vaciar',
    queue_title: 'Cola',
    queue_clear: 'Vaciar',
    features_title: 'Todas las funciones',
    features_sub: 'Un estudio multimedia completo en tu navegador',
    convert_desc: 'Vídeo, audio, imágenes — todos los formatos compatibles',
    editor_desc: 'Modifica título, artista, álbum, carátula',
    subtitles_desc: 'Extrae subtítulos en .srt o .vtt',
    gif_desc: 'Crea GIFs perfectos desde cualquier vídeo',
    thumb_title: 'Miniaturas',
    thumb_desc: 'Descarga la miniatura HD de cualquier vídeo',
    compress_title: 'Compresión',
    compress_desc: 'Reduce el tamaño de tus imágenes con control de calidad',
    convert_title: 'Convertidor',
    convert_title_span: 'universal',
    convert_sub: 'Vídeo, audio, imágenes — arrastra tu archivo y elige el formato de salida',
    video_drop_title: 'Arrastra tu vídeo aquí',
    video_drop_desc: 'o haz clic para elegir — MP4, MKV, AVI, MOV, WEBM, FLV…',
    output_format: 'Formato de salida',
    quality: 'Calidad',
    btn_convert: 'Convertir',
    converting: 'Convirtiendo…',
    audio_drop_title: 'Arrastra tu archivo de audio aquí',
    audio_drop_desc: 'MP3, WAV, FLAC, OGG, AAC, M4A…',
    img_drop_title: 'Arrastra tu imagen aquí',
    img_drop_desc: 'JPG, PNG, WEBP, AVIF, BMP, TIFF…',
    btn_compress_convert: 'Convertir / Comprimir',
    merge_desc: 'Fusiona una pista de audio en un vídeo existente',
    video_source: 'Vídeo (MP4, MKV…)',
    audio_source: 'Audio (MP3, WAV…)',
    merge_option: 'Opción de sincronización',
    merge_shortest: 'Recortar al más corto',
    merge_loop: 'Repetir audio',
    merge_pad: 'Agregar silencio',
    btn_merge: 'Fusionar',
    compress_tab_desc: 'Comprime tus imágenes con un control de calidad intuitivo',
    compress_drop_title: 'Arrastra tu imagen aquí',
    compress_drop_desc: 'JPG, PNG, WEBP…',
    btn_compress: 'Comprimir',
    editor_title: 'Editor',
    editor_title_span: 'MP3 / ID3',
    editor_sub: 'Modifica título, artista, álbum, género y carátula de tus archivos de audio',
    step1: '① Carga tu archivo de audio',
    step2: '② Edita los metadatos',
    step3: '③ Guardar',
    btn_save_tags: 'Guardar etiquetas',
    btn_reset: 'Restablecer',
    current_tags: 'Etiquetas actuales detectadas:',
    tips_title: 'Consejos',
    tip1: '🏷️ Las etiquetas ID3 se incrustan directamente en el archivo MP3',
    tip2: '🎨 Reproductores como Spotify, iTunes leen estos metadatos automáticamente',
    tip3: '📱 Perfecto para organizar tu biblioteca musical local',
    subtitles_title: 'Subtítulos &',
    subtitles_sub: 'Extrae subtítulos de vídeos de YouTube en .SRT o .VTT, y descarga miniaturas HD',
    include_auto: 'Incluir subtítulos automáticos',
    include_manual: 'Incluir subtítulos manuales',
    sub_info: 'ℹ️ Los subtítulos automáticos (generados por YouTube) también se recuperan si no hay subtítulos manuales disponibles.',
    btn_extract: 'Extraer subtítulos',
    extracting: 'Extrayendo subtítulos…',
    sub_help_title: 'Cómo usar .SRT',
    sub_help1: '🎬 VLC Media Player — Subtítulos → Agregar archivo de subtítulos',
    sub_help2: '🌐 Sitios web — Formato VTT recomendado para etiquetas de vídeo HTML5',
    sub_help3: '✏️ Edición — Abre .SRT en cualquier editor de texto',
    thumb_info: '🖼️ Descarga la miniatura en la máxima calidad disponible (hasta 1280×720 en YouTube)',
    btn_download_thumb: 'Descargar miniatura',
    preview: 'Vista previa:',
    gif_maker: 'Creador',
    gif_desc_page: 'Crea GIFs animados perfectos desde cualquier vídeo — paleta optimizada con FFmpeg',
    gif_drop_title: 'Arrastra tu vídeo aquí',
    gif_drop_desc: 'MP4, MKV, AVI, MOV, WEBM…',
    gif_params: 'Configuración del GIF',
    btn_create_gif: 'Crear GIF',
    btn_download_gif: 'Descargar GIF',
    btn_cancel: 'Cancelar',
    gif_generating: 'Generando GIF…',
    gif_tips_title: 'Consejos para un GIF perfecto',
    tip_duration: '⏱️ Duración ideal: 3 a 8 segundos para un GIF fluido y ligero',
    tip_width: '📐 Ancho recomendado: 480px para web, 320px para móvil',
    tip_palette: '🎨 Paleta de 256 colores generada inteligentemente por FFmpeg',
    tip_fps: '🐢 FPS bajo (8-12) = archivo ligero. FPS alto (20+) = animación fluida',
    tip_start: '🔪 Comienza con precisión: anota el segundo exacto de tu secuencia favorita',
    tip_share: '📱 Compartir: compatible con Discord, Telegram, WhatsApp, Twitter y más',
    history_title: 'Mi',
    history_title_span: 'Historial',
    history_sub: 'Encuentra todas tus descargas y conversiones recientes',
    recent_activity: 'Actividad reciente',
    loading: 'Cargando…',
    export_json: 'Exportar JSON',
    clear_all: 'Borrar todo',
    stats_title: 'Estadísticas',
    total_ops: 'Operaciones totales',
    total_dl: 'Descargas',
    total_conv: 'Conversiones',
    total_gif: 'GIFs creados',
    footer_donate: 'Donar',
donate_title: 'Apoyar',
donate_title_span: 'MediaForge',
donate_sub: 'Tu apoyo ayuda a mejorar la aplicación, añadir nuevas funciones y mantener los servidores.',
donate_paypal_desc: 'Pago seguro con tarjeta o cuenta PayPal.',
donate_paypal_btn: 'Donar vía PayPal',
donate_kofi_desc: 'Apoya con un café virtual, sin comisiones.',
donate_kofi_btn: 'Invítame un café',
donate_github_desc: 'Conviértete en patrocinador en GitHub para un apoyo recurrente.',
donate_github_btn: 'Patrocinar en GitHub',
donate_crypto_desc: 'Bitcoin, Ethereum, etc. (direcciones disponibles bajo petición).',
donate_crypto_btn: 'Ver direcciones',
donate_thanks_title: '¡Gracias por tu apoyo!',
donate_thanks_desc: 'Cada donación, por pequeña que sea, ayuda a mejorar MediaForge. Tu nombre aparecerá en los créditos si lo deseas.',
donate_why_title: '¿Por qué donar?',
donate_why_server: 'Alojamiento y ancho de banda',
donate_why_dev: 'Desarrollo de nuevas funciones',
donate_why_support: 'Soporte técnico y mantenimiento',
donate_unavailable: 'No disponible por el momento',
donate_paypal_powered: 'Optimizado por',
donate_crypto_note: 'Los fondos van directamente a mi cuenta de Binance. ¡Gracias por tu generosidad!',
crypto_badge:       'Donaciones seguras',
trust_secure:       'Transacciones seguras',
trust_chain:        'Verificables en la blockchain',
trust_multi:        '5 criptos aceptadas',
binance_badge:      'Cuenta Binance verificada · Todas las direcciones activas',
copy_address:       'Copiar dirección',
crypto_title:       'Donar en',
crypto_title_span:  'criptomonedas',
crypto_sub:         'Apoya MediaForge con Bitcoin, Ethereum, USDT, BNB y más. Los fondos van directamente a mi cuenta de Binance.',
crypto_note_title:  'Transacciones 100 % seguras',
crypto_note:        'Todas estas direcciones apuntan a mi cuenta de Binance verificada. Cada transacción es inmutable y verificable en la blockchain. ¡Muchas gracias por tu apoyo, hace una gran diferencia!',
crypto_back:        '← Volver a donaciones',
  },
  ar: {
    nav_home: 'الرئيسية', nav_convert: 'تحويل', nav_editor: 'محرر MP3',
    nav_subtitles: 'ترجمات', nav_gif: 'صانع GIF', nav_history: 'السجل',
    nav_settings: 'الإعدادات',
    settings_title: 'الإعدادات', settings_lang: 'اللغة',
    settings_download: 'التنزيل', settings_quality: 'الجودة الافتراضية',
    settings_quality_sub: 'تنسيق الفيديو المفضل', settings_audio_mp3: 'فرض MP3',
    settings_audio_mp3_sub: 'تحويل الصوت إلى MP3 192kbps', settings_thumbnail: 'الصورة المصغرة التلقائية',
    settings_thumbnail_sub: 'تنزيل الصورة المصغرة أيضاً', settings_ui: 'الواجهة',
    settings_animations: 'الرسوم المتحركة', settings_animations_sub: 'التأثيرات البصرية والانتقالات',
    settings_notifications: 'الإشعارات', settings_notifications_sub: 'تنبيهات النجاح والأخطاء',
    settings_theme: 'الوضع المظلم / الفاتح', settings_theme_sub: 'تغيير المظهر',
    settings_install: 'التطبيق', settings_install_sub: 'تثبيت أو فتح MediaForge',
    settings_update: 'تحديث', settings_update_sub: 'نسخة جديدة متاحة',
    settings_about: 'حول', settings_powered: 'مدعوم بواسطة',
    footer_powered: 'مدعوم بواسطة', footer_built: 'مبني بـ ❤️ على Termux',
    footer_version: 'الإصدار 2.1',
    footer_license: 'رخصة MIT',
    hero_badge: 'منصة وسائط متعددة 2026',
    hero_title: 'حمّل. حوّل.<br/><span>اصنع وسائطك.</span>',
    hero_desc: 'YouTube، TikTok، Instagram، X وأكثر من 1000 موقع. تحويل الفيديو والصوت والصور. GIF، ترجمات، محرر MP3 — كل شيء في مكان واحد.',
    btn_analyze: 'تحليل', btn_download: 'تنزيل', btn_save: 'حفظ',
    downloading: 'جاري التنزيل…',
    audio_only: 'صوت فقط (MP3)',
    auto_thumbnail: 'الصورة المصغرة أيضاً',
    batch_title: 'تنزيل دفعة',
    batch_desc: 'رابط واحد لكل سطر — الحد الأقصى 10',
    batch_download: 'تنزيل الكل',
    clear: 'مسح',
    queue_title: 'قائمة الانتظار',
    queue_clear: 'مسح',
    features_title: 'جميع الميزات',
    features_sub: 'استوديو وسائط متكامل في متصفحك',
    convert_desc: 'فيديو، صوت، صور — جميع الصيغ مدعومة',
    editor_desc: 'تعديل العنوان، الفنان، الألبوم، الغلاف',
    subtitles_desc: 'استخراج الترجمات بصيغة .srt أو .vtt',
    gif_desc: 'إنشاء صور GIF مثالية من أي فيديو',
    thumb_title: 'الصور المصغرة',
    thumb_desc: 'تنزيل الصورة المصغرة عالية الدقة من أي فيديو',
    compress_title: 'الضغط',
    compress_desc: 'تقليل حجم الصور مع التحكم بالجودة',
    convert_title: 'محول',
    convert_title_span: 'عالمي',
    convert_sub: 'فيديو، صوت، صور — اسحب ملفك واختر الصيغة الهدف',
    video_drop_title: 'اسحب الفيديو هنا',
    video_drop_desc: 'أو انقر للاختيار — MP4، MKV، AVI، MOV، WEBM، FLV…',
    output_format: 'صيغة الإخراج',
    quality: 'الجودة',
    btn_convert: 'تحويل',
    converting: 'جاري التحويل…',
    audio_drop_title: 'اسحب الملف الصوتي هنا',
    audio_drop_desc: 'MP3، WAV، FLAC، OGG، AAC، M4A…',
    img_drop_title: 'اسحب الصورة هنا',
    img_drop_desc: 'JPG، PNG، WEBP، AVIF، BMP، TIFF…',
    btn_compress_convert: 'تحويل / ضغط',
    merge_desc: 'دمج مسار صوتي مع فيديو موجود',
    video_source: 'فيديو (MP4، MKV…)',
    audio_source: 'صوت (MP3، WAV…)',
    merge_option: 'خيار المزامنة',
    merge_shortest: 'قص إلى الأقصر',
    merge_loop: 'تكرار الصوت',
    merge_pad: 'إضافة صمت',
    btn_merge: 'دمج',
    compress_tab_desc: 'ضغط صورك باستخدام شريط جودة بديهي',
    compress_drop_title: 'اسحب الصورة هنا',
    compress_drop_desc: 'JPG، PNG، WEBP…',
    btn_compress: 'ضغط',
    editor_title: 'محرر',
    editor_title_span: 'MP3 / ID3',
    editor_sub: 'تعديل العنوان، الفنان، الألبوم، النوع والغلاف لملفاتك الصوتية',
    step1: '① حمّل الملف الصوتي',
    step2: '② عدّل البيانات الوصفية',
    step3: '③ حفظ',
    btn_save_tags: 'حفظ العلامات',
    btn_reset: 'إعادة تعيين',
    current_tags: 'العلامات الحالية المكتشفة:',
    tips_title: 'نصائح',
    tip1: '🏷️ علامات ID3 مضمنة مباشرة في ملف MP3',
    tip2: '🎨 المشغلات مثل Spotify و iTunes تقرأ هذه البيانات تلقائياً',
    tip3: '📱 مثالية لتنظيم مكتبتك الموسيقية المحلية',
    subtitles_title: 'ترجمات &',
    subtitles_sub: 'استخراج ترجمات فيديو YouTube بصيغة .SRT أو .VTT، وتنزيل الصور المصغرة عالية الدقة',
    include_auto: 'تضمين الترجمات التلقائية',
    include_manual: 'تضمين الترجمات اليدوية',
    sub_info: 'ℹ️ يتم أيضاً استرداد الترجمات التلقائية (التي يولدها YouTube) إذا لم تكن الترجمات اليدوية متوفرة.',
    btn_extract: 'استخراج الترجمات',
    extracting: 'جاري استخراج الترجمات…',
    sub_help_title: 'كيفية استخدام .SRT',
    sub_help1: '🎬 VLC Media Player — ترجمات → إضافة ملف ترجمة',
    sub_help2: '🌐 مواقع الويب — صيغة VTT موصى بها لعلامات الفيديو HTML5',
    sub_help3: '✏️ تحرير — افتح .SRT في أي محرر نصوص',
    thumb_info: '🖼️ تنزيل الصورة المصغرة بأعلى جودة متاحة (حتى 1280×720 على YouTube)',
    btn_download_thumb: 'تنزيل الصورة المصغرة',
    preview: 'معاينة:',
    gif_maker: 'صانع',
    gif_desc_page: 'إنشاء صور GIF متحركة مثالية من أي فيديو — لوحة ألوان محسّنة بواسطة FFmpeg',
    gif_drop_title: 'اسحب الفيديو هنا',
    gif_drop_desc: 'MP4، MKV، AVI، MOV، WEBM…',
    gif_params: 'إعدادات GIF',
    btn_create_gif: 'إنشاء GIF',
    btn_download_gif: 'تنزيل GIF',
    btn_cancel: 'إلغاء',
    gif_generating: 'جاري إنشاء GIF…',
    gif_tips_title: 'نصائح للحصول على GIF مثالي',
    tip_duration: '⏱️ المدة المثالية: من 3 إلى 8 ثوانٍ للحصول على GIF سلس وخفيف',
    tip_width: '📐 العرض الموصى به: 480 بكسل للويب، 320 بكسل للجوال',
    tip_palette: '🎨 لوحة ألوان 256 لوناً يتم إنشاؤها بذكاء بواسطة FFmpeg',
    tip_fps: '🐢 عدد إطارات منخفض (8-12) = ملف خفيف. عدد إطارات مرتفع (20+) = حركة سلسة',
    tip_start: '🔪 ابدأ بدقة: لاحظ الثانية الدقيقة للتسلسل المفضل لديك',
    tip_share: '📱 مشاركة: متوافق مع Discord و Telegram و WhatsApp و Twitter والمزيد',
    history_title: 'سجلي',
    history_title_span: 'التاريخ',
    history_sub: 'اعثر على جميع تنزيلاتك وتحويلاتك الأخيرة',
    recent_activity: 'النشاط الأخير',
    loading: 'جار التحميل…',
    export_json: 'تصدير JSON',
    clear_all: 'مسح الكل',
    stats_title: 'الإحصائيات',
    total_ops: 'إجمالي العمليات',
    total_dl: 'التنزيلات',
    total_conv: 'التحويلات',
    total_gif: 'GIFs تم إنشاؤها',
    footer_donate: 'تبرع',
donate_title: 'ادعم',
donate_title_span: 'MediaForge',
donate_sub: 'دعمك يساعد في تحسين التطبيق وإضافة ميزات جديدة وصيانة الخوادم.',
donate_paypal_desc: 'دفع آمن عبر البطاقة أو حساب PayPal.',
donate_paypal_btn: 'تبرع عبر PayPal',
donate_kofi_desc: 'ادعم بـ "قهوة افتراضية" بدون عمولات.',
donate_kofi_btn: 'اشترِ لي قهوة',
donate_github_desc: 'كن راعياً على GitHub لدعم متكرر.',
donate_github_btn: 'رعاية عبر GitHub',
donate_crypto_desc: 'بيتكوين، إيثيريوم، إلخ. (العناوين متاحة عند الطلب).',
donate_crypto_btn: 'عرض العناوين',
donate_thanks_title: 'شكراً لدعمكم!  ',
donate_thanks_desc: 'كل تبرع، مهما كان صغيراً، يساهم في تحسين MediaForge. سيظهر اسمك في قائمة المساهمين إذا أردت.',
donate_why_title: 'لماذا التبرع؟',
donate_why_server: 'استضافة وسعة نقل',
donate_why_dev: 'تطوير ميزات جديدة',
donate_why_support: 'دعم فني وصيانة',
donate_unavailable: 'غير متاح حالياً',
donate_paypal_powered:'مدعوم من',
donate_crypto_note: 'تذهب الأموال مباشرة إلى حسابي في Binance. شكراً لكرمك!',
crypto_badge:       'تبرعات آمنة',
trust_secure:       'معاملات آمنة',
trust_chain:        'قابلة للتحقق على البلوكشين',
trust_multi:        '5 عملات مقبولة',
binance_badge:      'حساب Binance موثق · جميع العناوين نشطة',
copy_address:       'نسخ العنوان',
crypto_title:       'التبرع بـ',
crypto_title_span:  'العملات المشفرة',
crypto_sub:         'ادعم MediaForge بـ Bitcoin وEthereum وUSDT وBNB والمزيد. تذهب الأموال مباشرة إلى حسابي في Binance.',
crypto_note_title:  'معاملات آمنة 100%',
crypto_note:        'جميع هذه العناوين تشير إلى حسابي الموثق في Binance. كل معاملة غير قابلة للتغيير ويمكن التحقق منها على البلوكشين. شكراً جزيلاً لدعمكم — هذا يصنع فرقاً حقيقياً!',
crypto_back:        '→ العودة إلى التبرعات',

  },
};

let currentLang = localStorage.getItem('mf_lang') || 'fr';

// Mise à jour du drapeau dans l'icône de langue
function updateLangFlag(lang) {
  const flagMap = {
    fr: '🇫🇷',
    en: '🇬🇧',
    es: '🇪🇸',
    ar: '🇦🇪'
  };
  const flag = flagMap[lang] || '🏳️';
  const flagSpan = document.getElementById('lang-flag');
  if (flagSpan) flagSpan.textContent = flag;
}

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('mf_lang', lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS['fr'];
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });
  const labels = { fr:'FR', en:'EN', es:'ES', ar:'AR' };
  document.querySelectorAll('#lang-label-nav, #lang-label-mobile').forEach(el => {
    el.textContent = labels[lang] || lang.toUpperCase();
  });
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });
  updateLangFlag(lang);
}

function setLang(lang) {
  applyLang(lang);
  toast(TRANSLATIONS[lang]?.settings_lang || 'Language updated', 'success', 2000);
}


// ─── SETTINGS PANEL ──────────────────────────────────────────────────────────
let settingsOpen = false;

function openSettings(section) {
  document.getElementById('settings-overlay').classList.add('open');
  document.getElementById('settings-panel').classList.add('open');
  document.getElementById('btn-settings').classList.add('active');
  settingsOpen = true;
  if (section === 'lang') {
    setTimeout(() => {
      const el = document.getElementById('settings-lang-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  }
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('open');
  document.getElementById('settings-panel').classList.remove('open');
  document.getElementById('btn-settings').classList.remove('active');
  settingsOpen = false;
}

function saveSetting(key, value) {
  const s = loadSettings();
  s[key] = value;
  localStorage.setItem('mf_settings', JSON.stringify(s));
}

function loadSettings() {
  try { return JSON.parse(localStorage.getItem('mf_settings') || '{}'); }
  catch { return {}; }
}

function applySettings() {
  const s = loadSettings();
  if (s.quality) {
    const el = document.getElementById('setting-quality');
    if (el) el.value = s.quality;
  }
  if (s.force_mp3 !== undefined) {
    const el = document.getElementById('setting-force-mp3');
    if (el) el.checked = s.force_mp3;
  }
  if (s.auto_thumb !== undefined) {
    const el = document.getElementById('setting-auto-thumb');
    if (el) el.checked = s.auto_thumb;
  }
  if (s.animations !== undefined) {
    const el = document.getElementById('setting-animations');
    if (el) el.checked = s.animations;
    toggleAnimations(s.animations);
  }
  if (s.toasts !== undefined) {
    const el = document.getElementById('setting-toasts');
    if (el) el.checked = s.toasts;
  }
}

function toggleAnimations(enabled) {
  if (!enabled) {
    document.querySelectorAll('[class*="anim-"]').forEach(el => {
      el.style.animation = 'none';
    });
  }
}

// ─── THÈME CLAIR/SOMBRE ───────────────────────────────────────────────────────
function toggleTheme(isDark) {
  // isDark: true = thème sombre, false = thème clair
  if (isDark) {
    document.body.classList.remove('light-theme');
    localStorage.setItem('mf_theme', 'dark');
  } else {
    document.body.classList.add('light-theme');
    localStorage.setItem('mf_theme', 'light');
  }
  // Mettre à jour le toggle dans les paramètres (si présent)
  const darkToggle = document.getElementById('setting-darkmode');
  if (darkToggle) {
    darkToggle.checked = isDark;
  }
}

function applySavedTheme() {
  const saved = localStorage.getItem('mf_theme');
  // Par défaut, thème sombre (true)
  const isDark = saved !== 'light'; // si sauvegardé 'light', alors isDark = false
  const darkToggle = document.getElementById('setting-darkmode');
  if (darkToggle) {
    darkToggle.checked = isDark;
  }
  toggleTheme(isDark);
}

// ─── PWA : Installation et mise à jour ─────────────────────────────────────────
let deferredPrompt = null;
let isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

// Écoute l'événement d'installation proposé par le navigateur
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Afficher une notification si l'app n'est pas encore installée
  if (!isAppInstalled) {
    toast('Installez MediaForge sur votre appareil pour un accès rapide !', 'info', 8000);
  }
  updateInstallButton();
});

// Détection de l'installation effective
window.addEventListener('appinstalled', () => {
  isAppInstalled = true;
  deferredPrompt = null;
  updateInstallButton();
  toast('MediaForge installé avec succès !', 'success');
});

// Met à jour le texte et l'action du bouton d'installation dans les paramètres
function updateInstallButton() {
  const installBtn = document.getElementById('btn-install-app');
  if (!installBtn) return;
  if (isAppInstalled) {
    installBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"/><polyline points="15 10 12 13 9 10"/><line x1="12" y1="13" x2="12" y2="3"/></svg> Ouvrir l\'application';
    installBtn.onclick = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        // Déjà en standalone, on ne fait rien
        toast('Application déjà ouverte', 'info');
      } else {
        // Essayer d'ouvrir l'application installée (si possible)
        window.location.href = '/';
        toast('Ouvrez l\'application depuis votre écran d\'accueil', 'info');
      }
    };
  } else {
    installBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Installer l\'application';
    installBtn.onclick = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choiceResult => {
          if (choiceResult.outcome === 'accepted') {
            console.log('Installation acceptée');
          } else {
            console.log('Installation refusée');
          }
          deferredPrompt = null;
          updateInstallButton();
        });
      } else {
        toast('Installation non disponible sur ce navigateur', 'warning');
      }
    };
  }
}

// Vérifie s'il y a une nouvelle version en attente
function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg && reg.waiting) {
        // Nouvelle version en attente
        const updateBtn = document.getElementById('btn-update-app');
        if (updateBtn) updateBtn.style.display = 'inline-flex';
        toast('Une nouvelle version est disponible ! Cliquez pour mettre à jour.', 'info', 10000);
      } else {
        const updateBtn = document.getElementById('btn-update-app');
        if (updateBtn) updateBtn.style.display = 'none';
      }
    });
  }
}

// Déclenche la mise à jour
function updateApp() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        toast('Mise à jour en cours...', 'info');
      } else {
        toast('Aucune mise à jour disponible', 'info');
      }
    });
  }
}

// Surveiller les mises à jour du service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Recharger la page pour prendre la nouvelle version
    window.location.reload();
  });
}

// Vérification périodique des mises à jour (toutes les 60 secondes)
setInterval(checkForUpdates, 60000);

// ─── MOBILE MENU ─────────────────────────────────────────────────────────────
let mobileMenuOpen = false;

function toggleMobileMenu() {
  mobileMenuOpen = !mobileMenuOpen;
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('open', mobileMenuOpen);
}

function closeMobileMenu() {
  mobileMenuOpen = false;
  document.getElementById('mobile-menu').classList.remove('open');
}

// ─── TOAST SYSTEM ─────────────────────────────────────────────────────────────
function toast(msg, type = 'info', duration = 4000) {
  const s = loadSettings();
  if (s.toasts === false) return;
  const iconMap = { success: ICONS.check, error: ICONS.error, info: ICONS.info, warning: ICONS.warning };
  const colorMap = { success: 'var(--success)', error: 'var(--error)', info: 'var(--accent-2)', warning: 'var(--warning)' };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span style="color:${colorMap[type]}">${iconMap[type] || ICONS.info}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'slideIn 0.35s ease reverse both';
    setTimeout(() => el.remove(), 350);
  }, duration);
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const contents = container.querySelectorAll('.tab-content');
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        if (contents[i]) contents[i].classList.add('active');
      });
    });
  });
}

// ─── ACTIVE NAV LINK ──────────────────────────────────────────────────────────
function markActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link, .mobile-link').forEach(a => {
    const href = a.getAttribute('href');
    const isActive = href === path || (href !== '/' && path.startsWith(href));
    a.classList.toggle('active', isActive);
  });
}

// ─── FORMAT HELPERS ──────────────────────────────────────────────────────────
function formatDuration(s) {
  if (!s) return '--';
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = Math.floor(s%60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${m}:${String(sec).padStart(2,'0')}`;
}

function formatSize(b) {
  if (!b) return '--';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  if (b < 1073741824) return (b/1048576).toFixed(1) + ' MB';
  return (b/1073741824).toFixed(2) + ' GB';
}

function formatViews(n) {
  if (!n) return '--';
  if (n >= 1e9) return (n/1e9).toFixed(1) + 'B vues';
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M vues';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'K vues';
  return n + ' vues';
}

// ─── DRAG AND DROP ────────────────────────────────────────────────────────────
function initDropzone(dropEl, fileInputEl, onFile) {
  if (!dropEl) return;
  dropEl.addEventListener('click', () => fileInputEl?.click());
  dropEl.addEventListener('dragover', e => { e.preventDefault(); dropEl.classList.add('drag-over'); });
  dropEl.addEventListener('dragleave', () => dropEl.classList.remove('drag-over'));
  dropEl.addEventListener('drop', e => {
    e.preventDefault(); dropEl.classList.remove('drag-over');
    if (e.dataTransfer.files.length && onFile) onFile(e.dataTransfer.files[0]);
  });
  if (fileInputEl) {
    fileInputEl.addEventListener('change', () => {
      if (fileInputEl.files.length && onFile) onFile(fileInputEl.files[0]);
    });
  }
}

function updateProgress(wrapEl, fillEl, pctLabel, statsEl, percent, speed, eta) {
  if (!wrapEl) return;
  wrapEl.classList.add('show');
  if (fillEl) fillEl.style.width = percent + '%';
  if (pctLabel) pctLabel.textContent = Math.round(percent) + '%';
  if (statsEl && speed) statsEl.textContent = `${speed} — ${eta || '--'}`;
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────
const History = {
  KEY: 'mediaforge_history',
  get() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; } },
  add(entry) {
    const h = this.get();
    h.unshift({ ...entry, id: Date.now(), date: new Date().toISOString() });
    if (h.length > 100) h.splice(100);
    localStorage.setItem(this.KEY, JSON.stringify(h));
  },
  clear() { localStorage.removeItem(this.KEY); }
};

// ─── QUEUE (persistante et avec annulation) ────────────────────────────────────
const Queue = {
  KEY: 'mediaforge_queue',
  items: {},
  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.KEY) || '{}');
      this.items = saved;
    } catch { this.items = {}; }
    this.render();
  },
  save() {
    localStorage.setItem(this.KEY, JSON.stringify(this.items));
  },
  add(taskId, name, type = 'download') {
    this.items[taskId] = { name, type, percent: 0, status: 'pending', download_url: null };
    this.save();
    this.render();
  },
  update(taskId, patch) {
    if (this.items[taskId]) {
      Object.assign(this.items[taskId], patch);
      this.save();
      this.render();
    }
  },
  remove(taskId) {
    delete this.items[taskId];
    this.save();
    this.render();
  },
  clearAll() {
    this.items = {};
    this.save();
    this.render();
  },
  render() {
    const container = document.getElementById('queue-list');
    if (!container) return;
    const entries = Object.entries(this.items);
    if (!entries.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">${ICONS.inbox}</div>
        <h3 data-i18n="queue_empty">Aucune tâche en cours</h3>
        <p data-i18n="queue_empty_desc">Tes téléchargements apparaîtront ici</p>
      </div>`;
      return;
    }
    container.innerHTML = entries.map(([id, item]) => {
      const iconMap = { download: ICONS.download, video: ICONS.video, audio: ICONS.audio, convert: ICONS.convert, gif: ICONS.gif };
      const icon = iconMap[item.type] || ICONS.download;
      const colorMap = { download:'rgba(108,99,255,0.2)', video:'rgba(0,212,255,0.15)', audio:'rgba(255,107,157,0.15)', convert:'rgba(108,99,255,0.2)', gif:'rgba(0,229,160,0.12)' };
      const color = colorMap[item.type] || 'rgba(108,99,255,0.2)';
      const statusLabel = { pending: 'En attente', downloading: `${Math.round(item.percent)}%`, done: 'Terminé', error: 'Erreur', cancelled: 'Annulé' };
      const statusClass = `status-${item.status}`;
      const cancelButton = (item.status === 'downloading' || item.status === 'pending') ?
        `<button class="btn btn-ghost btn-sm" onclick="Queue.cancel('${id}')" style="padding:2px 6px;">${ICONS.error}</button>` : '';
      return `<div class="queue-item">
        <div class="queue-icon" style="background:${color};color:var(--accent-1)">${icon}</div>
        <div class="queue-info">
          <div class="queue-name">${escapeHtml(item.name) || id}</div>
          <div class="queue-progress-mini"><div class="queue-progress-fill" style="width:${item.percent}%"></div></div>
        </div>
        <div class="queue-actions" style="display:flex;gap:4px;align-items:center;">
          ${cancelButton}
          <span class="queue-status ${statusClass}">${statusLabel[item.status] || item.status}</span>
          ${item.download_url ? `<a class="btn btn-success btn-sm" href="${item.download_url}" download>${ICONS.download}</a>` : ''}
        </div>
      </div>`;
    }).join('');
  },
  async cancel(taskId) {
    const item = this.items[taskId];
    if (!item) return;
    const type = item.type === 'download' ? 'download' : (item.type === 'convert' ? 'convert' : (item.type === 'gif' ? 'gif' : 'download'));
    try {
      await fetch(`/api/cancel/${type}/${taskId}`, { method: 'POST' });
      this.update(taskId, { status: 'cancelled', percent: 0 });
      toast('Tâche annulée', 'info');
    } catch(e) {
      console.error(e);
    }
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// ─── SOCKET EVENTS ────────────────────────────────────────────────────────────
socket.on('connect', () => console.log('⚡ MediaForge v2.1 connecté'));
socket.on('disconnect', () => toast('Connexion perdue…', 'warning'));

socket.on('progress', data => {
  Queue.update(data.task_id, { percent: data.percent, status: 'downloading' });
  const fill = document.getElementById('progress-fill');
  const pct = document.getElementById('progress-pct');
  const stats = document.getElementById('progress-stats');
  const wrap = document.getElementById('progress-wrap');
  updateProgress(wrap, fill, pct, stats, data.percent, data.speed, data.eta);
});

socket.on('download_complete', data => {
  Queue.update(data.task_id, { percent: 100, status: 'done', download_url: data.download_url });
  toast(`Téléchargé : ${data.filename}`, 'success');
  History.add({ type: 'download', icon: '📥', name: data.filename, url: data.download_url });
  const dlBtn = document.getElementById('download-result-btn');
  if (dlBtn) { dlBtn.style.display = 'inline-flex'; dlBtn.href = data.download_url; dlBtn.setAttribute('download', data.filename); }
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.background = 'linear-gradient(90deg,var(--success),var(--accent-2))';
});

socket.on('download_error', data => {
  Queue.update(data.task_id, { status: 'error' });
  toast(`Erreur : ${data.error?.slice(0,100)}`, 'error', 6000);
});

socket.on('download_cancelled', data => {
  Queue.update(data.task_id, { status: 'cancelled' });
});

socket.on('convert_complete', data => {
  toast(`Converti : ${data.filename}`, 'success');
  History.add({ type: 'convert', icon: '🔄', name: data.filename, url: data.download_url });
  const dlBtn = document.getElementById('convert-result-btn') || document.getElementById('audio-result-btn');
  if (dlBtn) { dlBtn.style.display = 'inline-flex'; dlBtn.href = data.download_url; dlBtn.setAttribute('download', data.filename); }
});

socket.on('convert_error', data => toast(`Erreur conversion : ${data.error?.slice(0,100)}`, 'error', 6000));
socket.on('convert_cancelled', data => toast('Conversion annulée', 'info'));

socket.on('gif_complete', data => {
  toast('GIF créé avec succès !', 'success');
  History.add({ type: 'gif', icon: '🎞️', name: 'output.gif', url: data.download_url });
  const dlBtn = document.getElementById('gif-result-btn');
  if (dlBtn) { dlBtn.style.display = 'inline-flex'; dlBtn.href = data.download_url; dlBtn.setAttribute('download', 'output.gif'); }
});

socket.on('gif_error', data => toast(`Erreur GIF : ${data.error?.slice(0,80)}`, 'error', 6000));
socket.on('gif_cancelled', data => toast('Génération du GIF annulée', 'info'));

// Close mobile menu on outside click
document.addEventListener('click', e => {
  if (mobileMenuOpen && !e.target.closest('#mobile-menu') && !e.target.closest('#hamburger')) {
    closeMobileMenu();
  }
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyLang(currentLang);
  applySettings();
  initTabs();
  markActiveNav();
  Queue.load();
  applySavedTheme();  // applique le thème sauvegardé
  updateInstallButton();
  // Si un service worker en attente est détecté au chargement
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg && reg.waiting) {
        const updateBtn = document.getElementById('btn-update-app');
        if (updateBtn) updateBtn.style.display = 'inline-flex';
      }
    });
  }
});