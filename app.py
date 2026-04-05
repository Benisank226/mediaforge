import os
import uuid
import json
import base64
import subprocess
import threading
import time
import logging
from flask import Flask, render_template, request, jsonify, send_file, abort, after_this_request
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
import yt_dlp
import tempfile

# Configuration du logging
logging.basicConfig(level=logging.INFO)
app_logger = logging.getLogger(__name__)

tmp_dir = tempfile.gettempdir()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'mediaforge-secret-2026')
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max upload
app.config['UPLOAD_FOLDER'] = os.path.join(tmp_dir, 'uploads')
app.config['DOWNLOAD_FOLDER'] = os.path.join(tmp_dir, 'downloads')
app.config['CONVERTED_FOLDER'] = os.path.join(tmp_dir, 'converted')

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Ensure folders exist
for folder in [app.config['UPLOAD_FOLDER'], app.config['DOWNLOAD_FOLDER'], app.config['CONVERTED_FOLDER']]:
    os.makedirs(folder, exist_ok=True)

# Durée de conservation des fichiers (en secondes) – 1 heure
FILE_RETENTION_SECONDS = 3600

# Limit concurrent downloads (max 3)
download_semaphore = threading.Semaphore(3)

# Store active subprocesses for cancellation
active_downloads = {}  # task_id -> subprocess
active_conversions = {}  # task_id -> subprocess
active_gifs = {}  # task_id -> subprocess

# Configuration commune pour yt-dlp (PO Token + cookies + user agent)
YDL_COMMON_OPTS = {
    'quiet': True,
    'no_warnings': True,
    'ignoreerrors': True,
    'cookiefile': 'cookies.txt',
    'user_agent': 'Mozilla/5.0 (Linux; Android 10; STK-L22) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'extractor_args': {
        'youtube': {
            'player_client': ['web', 'android'],
           # 'po_token': ['web']   Le provider PO Token injectera automatiquement la valeur
        }
    }
}

# ─── ROUTES PRINCIPALES ───────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert')
def convert_page():
    return render_template('convert.html')

@app.route('/editor')
def editor_page():
    return render_template('editor.html')

@app.route('/subtitles')
def subtitles_page():
    return render_template('subtitles.html')

@app.route('/gifmaker')
def gifmaker_page():
    return render_template('gifmaker.html')

@app.route('/history')
def history_page():
    return render_template('history.html')

# ─── API : PREVIEW URL ────────────────────────────────────────────────────────
@app.route('/api/preview', methods=['POST'])
def preview():
    data = request.json
    url = data.get('url', '').strip()
    if not url:
        return jsonify({'error': 'URL manquante'}), 400
    try:
        ydl_opts = YDL_COMMON_OPTS.copy()
        ydl_opts['skip_download'] = True
        
        app_logger.info(f"Analyse de l'URL : {url}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if info is None:
                app_logger.error(f"extract_info a retourné None pour {url}")
                return jsonify({'error': 'Impossible d\'extraire les informations. Vérifiez l\'URL ou réessayez plus tard.'}), 500
            
            formats = []
            seen = set()
            for f in info.get('formats', []):
                if f.get('vcodec') != 'none' and f.get('height'):
                    key = f"{f['height']}p"
                    if key not in seen:
                        seen.add(key)
                        formats.append({'id': f['format_id'], 'label': key, 'type': 'video', 'ext': f.get('ext','mp4')})
                elif f.get('acodec') != 'none' and f.get('vcodec') == 'none':
                    key = f"audio_{f.get('abr',0)}"
                    if key not in seen:
                        seen.add(key)
                        formats.append({'id': f['format_id'], 'label': f"Audio {int(f.get('abr',0))}kbps", 'type': 'audio', 'ext': f.get('ext','m4a')})
            formats_video = sorted([x for x in formats if x['type']=='video'], key=lambda x: int(x['label'].replace('p','')), reverse=True)
            formats_audio = [x for x in formats if x['type']=='audio']
            return jsonify({
                'title': info.get('title',''),
                'thumbnail': info.get('thumbnail',''),
                'duration': info.get('duration',0),
                'uploader': info.get('uploader',''),
                'view_count': info.get('view_count',0),
                'platform': info.get('extractor',''),
                'formats': formats_video + formats_audio
            })
    except Exception as e:
        app_logger.exception("Erreur dans preview")
        return jsonify({'error': str(e)}), 500

# ─── API : TÉLÉCHARGEMENT VIDÉO/AUDIO (with cancel) ───────────────────────────
@app.route('/api/download', methods=['POST'])
def download_media():
    data = request.json
    url = data.get('url', '').strip()
    fmt = data.get('format', 'bestvideo+bestaudio')
    audio_only = data.get('audio_only', False)
    task_id = str(uuid.uuid4())

    def run_download(task_id, url, fmt, audio_only):
        with download_semaphore:
            out_path = os.path.join(app.config['DOWNLOAD_FOLDER'], task_id)
            os.makedirs(out_path, exist_ok=True)
            def progress_hook(d):
                if d['status'] == 'downloading':
                    pct = d.get('_percent_str','0%').strip().replace('%','')
                    speed = d.get('_speed_str','--')
                    eta = d.get('_eta_str','--')
                    try: pct_float = float(pct)
                    except: pct_float = 0
                    socketio.emit('progress', {'task_id': task_id, 'percent': pct_float, 'speed': speed, 'eta': eta})
                elif d['status'] == 'finished':
                    socketio.emit('progress', {'task_id': task_id, 'percent': 100, 'speed': '--', 'eta': '0s'})
            
            ydl_opts = YDL_COMMON_OPTS.copy()
            ydl_opts['outtmpl'] = os.path.join(out_path, '%(title)s.%(ext)s')
            ydl_opts['progress_hooks'] = [progress_hook]
            
            if audio_only:
                ydl_opts['format'] = 'bestaudio/best'
                ydl_opts['postprocessors'] = [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3', 'preferredquality': '192'}]
            else:
                if fmt and fmt != 'bestvideo+bestaudio':
                    ydl_opts['format'] = f'{fmt}+bestaudio/bestvideo+bestaudio/best'
                else:
                    ydl_opts['format'] = 'bestvideo+bestaudio/best'
                ydl_opts['merge_output_format'] = 'mp4'
                ydl_opts['postprocessors'] = [{
                    'key': 'FFmpegVideoConvertor',
                    'preferedformat': 'mp4',
                }]
            try:
                app_logger.info(f"Début du téléchargement pour {task_id} : {url}")
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([url])
                files = os.listdir(out_path)
                if files:
                    filename = files[0]
                    socketio.emit('download_complete', {'task_id': task_id, 'filename': filename, 'download_url': f'/api/get_file/downloads/{task_id}/{filename}'})
                    app_logger.info(f"Téléchargement terminé : {filename}")
                else:
                    socketio.emit('download_error', {'task_id': task_id, 'error': 'Fichier introuvable après téléchargement'})
                    app_logger.error(f"Aucun fichier trouvé dans {out_path}")
            except Exception as e:
                app_logger.exception(f"Erreur lors du téléchargement {task_id}")
                socketio.emit('download_error', {'task_id': task_id, 'error': str(e)})
            finally:
                if task_id in active_downloads:
                    del active_downloads[task_id]

    thread = threading.Thread(target=run_download, args=(task_id, url, fmt, audio_only))
    thread.daemon = True
    thread.start()
    return jsonify({'task_id': task_id})

@app.route('/api/cancel/<task_type>/<task_id>', methods=['POST'])
def cancel_task(task_type, task_id):
    """Cancel a running download, conversion, or gif task."""
    if task_type == 'download':
        proc = active_downloads.get(task_id)
        if proc:
            try:
                proc.terminate()
            except Exception:
                pass
            active_downloads.pop(task_id, None)
            socketio.emit('download_cancelled', {'task_id': task_id})
            return jsonify({'success': True})
    elif task_type == 'convert':
        proc = active_conversions.get(task_id)
        if proc:
            try:
                proc.terminate()
            except Exception:
                pass
            active_conversions.pop(task_id, None)
            socketio.emit('convert_cancelled', {'task_id': task_id})
            return jsonify({'success': True})
    elif task_type == 'gif':
        proc = active_gifs.get(task_id)
        if proc:
            try:
                proc.terminate()
            except Exception:
                pass
            active_gifs.pop(task_id, None)
            socketio.emit('gif_cancelled', {'task_id': task_id})
            return jsonify({'success': True})
    return jsonify({'error': 'Tâche introuvable ou déjà terminée'}), 404

# ─── API : TÉLÉCHARGEMENT SOUS-TITRES (avec option auto/manual) ───────────────
@app.route('/api/subtitles', methods=['POST'])
def download_subtitles():
    data = request.json
    url = data.get('url','').strip()
    lang = data.get('lang', 'fr')
    auto = data.get('auto', True)
    manual = data.get('manual', True)
    task_id = str(uuid.uuid4())
    out_path = os.path.join(app.config['DOWNLOAD_FOLDER'], task_id)
    os.makedirs(out_path, exist_ok=True)
    
    ydl_opts = YDL_COMMON_OPTS.copy()
    ydl_opts.update({
        'skip_download': True,
        'writesubtitles': manual,
        'writeautomaticsub': auto,
        'subtitleslangs': [lang],
        'subtitlesformat': 'srt',
        'outtmpl': os.path.join(out_path, '%(title)s'),
    })
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        files = os.listdir(out_path)
        if files:
            fn = files[0]
            return jsonify({'success': True, 'filename': fn, 'download_url': f'/api/get_file/downloads/{task_id}/{fn}'})
        else:
            return jsonify({'error': 'Sous-titres non disponibles pour cette langue'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ─── API : MINIATURE ──────────────────────────────────────────────────────────
@app.route('/api/thumbnail', methods=['POST'])
def download_thumbnail():
    data = request.json
    url = data.get('url','').strip()
    task_id = str(uuid.uuid4())
    out_path = os.path.join(app.config['DOWNLOAD_FOLDER'], task_id)
    os.makedirs(out_path, exist_ok=True)
    
    ydl_opts = YDL_COMMON_OPTS.copy()
    ydl_opts.update({
        'skip_download': True,
        'writethumbnail': True,
        'outtmpl': os.path.join(out_path, '%(title)s'),
    })
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        files = os.listdir(out_path)
        if files:
            fn = files[0]
            return jsonify({'success': True, 'filename': fn, 'download_url': f'/api/get_file/downloads/{task_id}/{fn}'})
        return jsonify({'error': 'Miniature introuvable'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ─── API : CONVERSION FFMPEG (with cancel) ─────────────────────────────────────
@app.route('/api/convert', methods=['POST'])
def convert_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier fourni'}), 400
    file = request.files['file']
    target_format = request.form.get('format', 'mp4')
    quality = request.form.get('quality', 'medium')
    task_id = str(uuid.uuid4())
    filename = secure_filename(file.filename)
    upload_path = os.path.join(app.config['UPLOAD_FOLDER'], task_id)
    os.makedirs(upload_path, exist_ok=True)
    input_path = os.path.join(upload_path, filename)
    file.save(input_path)
    base_name = os.path.splitext(filename)[0]
    output_filename = f"{base_name}_converted.{target_format}"
    output_path = os.path.join(app.config['CONVERTED_FOLDER'], task_id)
    os.makedirs(output_path, exist_ok=True)
    out_file = os.path.join(output_path, output_filename)

    quality_map = {'low': '28', 'medium': '23', 'high': '18'}
    crf = quality_map.get(quality, '23')

    cmd = ['ffmpeg', '-i', input_path, '-crf', crf, '-preset', 'fast', '-y', out_file]

    def run_convert():
        try:
            socketio.emit('convert_progress', {'task_id': task_id, 'status': 'processing'})
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            active_conversions[task_id] = proc
            stdout, stderr = proc.communicate()
            if proc.returncode == 0:
                socketio.emit('convert_complete', {'task_id': task_id, 'filename': output_filename, 'download_url': f'/api/get_file/converted/{task_id}/{output_filename}'})
            else:
                socketio.emit('convert_error', {'task_id': task_id, 'error': stderr[-500:]})
        except Exception as e:
            socketio.emit('convert_error', {'task_id': task_id, 'error': str(e)})
        finally:
            if task_id in active_conversions:
                del active_conversions[task_id]

    thread = threading.Thread(target=run_convert)
    thread.daemon = True
    thread.start()
    return jsonify({'task_id': task_id})

# ─── API : GIF MAKER (with cancel) ────────────────────────────────────────────
@app.route('/api/gif', methods=['POST'])
def make_gif():
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier fourni'}), 400
    file = request.files['file']
    start = request.form.get('start', '0')
    duration = request.form.get('duration', '5')
    fps = request.form.get('fps', '10')
    width = request.form.get('width', '480')
    task_id = str(uuid.uuid4())
    filename = secure_filename(file.filename)
    upload_path = os.path.join(app.config['UPLOAD_FOLDER'], task_id)
    os.makedirs(upload_path, exist_ok=True)
    input_path = os.path.join(upload_path, filename)
    file.save(input_path)
    output_path = os.path.join(app.config['CONVERTED_FOLDER'], task_id)
    os.makedirs(output_path, exist_ok=True)
    out_file = os.path.join(output_path, 'output.gif')

    palette_file = os.path.join(output_path, 'palette.png')
    cmd1 = ['ffmpeg','-ss', start,'-t', duration,'-i', input_path, '-vf', f'fps={fps},scale={width}:-1:flags=lanczos,palettegen', '-y', palette_file]
    cmd2 = ['ffmpeg','-ss', start,'-t', duration,'-i', input_path, '-i', palette_file, '-filter_complex', f'fps={fps},scale={width}:-1:flags=lanczos[x];[x][1:v]paletteuse', '-y', out_file]

    def run_gif():
        try:
            socketio.emit('gif_progress', {'task_id': task_id, 'status': 'generating_palette'})
            proc1 = subprocess.Popen(cmd1, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            active_gifs[task_id] = proc1
            stdout1, stderr1 = proc1.communicate()
            if proc1.returncode != 0:
                socketio.emit('gif_error', {'task_id': task_id, 'error': 'Erreur palette'})
                return
            socketio.emit('gif_progress', {'task_id': task_id, 'status': 'creating_gif'})
            proc2 = subprocess.Popen(cmd2, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            active_gifs[task_id] = proc2
            stdout2, stderr2 = proc2.communicate()
            if proc2.returncode == 0:
                socketio.emit('gif_complete', {'task_id': task_id, 'filename': 'output.gif', 'download_url': f'/api/get_file/converted/{task_id}/output.gif'})
            else:
                socketio.emit('gif_error', {'task_id': task_id, 'error': 'Erreur création GIF'})
        except Exception as e:
            socketio.emit('gif_error', {'task_id': task_id, 'error': str(e)})
        finally:
            if task_id in active_gifs:
                del active_gifs[task_id]

    thread = threading.Thread(target=run_gif)
    thread.daemon = True
    thread.start()
    return jsonify({'task_id': task_id})

# ─── API : ÉDITEUR MÉTADONNÉES MP3 (avec cover) ───────────────────────────────
@app.route('/api/metadata/read', methods=['POST'])
def read_metadata():
    if 'file' not in request.files:
        return jsonify({'error': 'Fichier manquant'}), 400
    file = request.files['file']
    task_id = str(uuid.uuid4())
    filename = secure_filename(file.filename)
    upload_path = os.path.join(app.config['UPLOAD_FOLDER'], task_id)
    os.makedirs(upload_path, exist_ok=True)
    input_path = os.path.join(upload_path, filename)
    file.save(input_path)
    try:
        cmd = ['ffprobe','-v','quiet','-print_format','json','-show_format','-show_streams', input_path]
        result = subprocess.run(cmd, capture_output=True, text=True)
        info = json.loads(result.stdout)
        tags = info.get('format',{}).get('tags',{})
        # Check for cover art
        cover = None
        for stream in info.get('streams', []):
            if stream.get('codec_type') == 'video' and stream.get('codec_name') in ['mjpeg', 'png', 'jpg']:
                cover = 'present'
                break
        return jsonify({'task_id': task_id, 'filename': filename, 'tags': tags, 'input_path': input_path, 'cover': cover})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/metadata/write', methods=['POST'])
def write_metadata():
    data = request.json
    input_path = data.get('input_path','')
    tags = data.get('tags', {})
    cover_file = data.get('cover_file', None)
    if not input_path or not os.path.exists(input_path):
        return jsonify({'error': 'Fichier introuvable'}), 400
    task_id = str(uuid.uuid4())
    output_path = os.path.join(app.config['CONVERTED_FOLDER'], task_id)
    os.makedirs(output_path, exist_ok=True)
    base = os.path.basename(input_path)
    out_file = os.path.join(output_path, base)
    cmd = ['ffmpeg', '-i', input_path]
    for k, v in tags.items():
        if v:
            cmd += ['-metadata', f'{k}={v}']
    if cover_file:
        cover_data = cover_file.split(',')[1] if ',' in cover_file else cover_file
        cover_path = os.path.join(output_path, 'cover.jpg')
        with open(cover_path, 'wb') as f:
            f.write(base64.b64decode(cover_data))
        meta_args = []
        for k, v in tags.items():
            if v:
                meta_args += ['-metadata', f'{k}={v}']
        cmd = [
            'ffmpeg', '-i', input_path, '-i', cover_path,
        ] + meta_args + [
            '-map', '0', '-map', '1',
            '-c', 'copy',
            '-id3v2_version', '3',
            '-metadata:s:v', 'title=Album cover',
            '-metadata:s:v', 'comment=Cover (front)',
            '-y', out_file
        ]
    else:
        cmd += ['-codec', 'copy', '-y', out_file]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            return jsonify({'success': True, 'filename': base, 'download_url': f'/api/get_file/converted/{task_id}/{base}'})
        return jsonify({'error': result.stderr[-300:]}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ─── API : MERGE AUDIO + VIDÉO (avec option ajuster durée) ────────────────────
@app.route('/api/merge', methods=['POST'])
def merge_av():
    if 'video' not in request.files or 'audio' not in request.files:
        return jsonify({'error': 'Vidéo et audio requis'}), 400
    video = request.files['video']
    audio = request.files['audio']
    option = request.form.get('option', 'shortest')
    task_id = str(uuid.uuid4())
    up_path = os.path.join(app.config['UPLOAD_FOLDER'], task_id)
    os.makedirs(up_path, exist_ok=True)
    vpath = os.path.join(up_path, secure_filename(video.filename))
    apath = os.path.join(up_path, secure_filename(audio.filename))
    video.save(vpath)
    audio.save(apath)
    out_path = os.path.join(app.config['CONVERTED_FOLDER'], task_id)
    os.makedirs(out_path, exist_ok=True)
    out_file = os.path.join(out_path, 'merged_output.mp4')
    if option == 'shortest':
        cmd = ['ffmpeg','-i', vpath,'-i', apath,'-c:v','copy','-c:a','aac','-shortest','-y', out_file]
    elif option == 'loop':
        cmd = ['ffmpeg','-i', vpath,'-stream_loop','-1','-i', apath,'-c:v','copy','-c:a','aac','-shortest','-y', out_file]
    elif option == 'pad':
        cmd = ['ffmpeg','-i', vpath,'-i', apath,'-c:v','copy','-c:a','aac','-shortest','-y', out_file]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            return jsonify({'success': True, 'filename': 'merged_output.mp4', 'download_url': f'/api/get_file/converted/{task_id}/merged_output.mp4'})
        return jsonify({'error': result.stderr[-300:]}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ─── API : COMPRESSION IMAGE (avec options supplémentaires) ────────────────────
@app.route('/api/compress_image', methods=['POST'])
def compress_image():
    if 'file' not in request.files:
        return jsonify({'error': 'Fichier manquant'}), 400
    file = request.files['file']
    quality = int(request.form.get('quality', 80))
    target_format = request.form.get('format', 'jpg')
    effort = request.form.get('effort', '4')
    task_id = str(uuid.uuid4())
    filename = secure_filename(file.filename)
    up_path = os.path.join(app.config['UPLOAD_FOLDER'], task_id)
    os.makedirs(up_path, exist_ok=True)
    input_path = os.path.join(up_path, filename)
    file.save(input_path)
    base = os.path.splitext(filename)[0]
    out_name = f"{base}_compressed.{target_format}"
    out_path = os.path.join(app.config['CONVERTED_FOLDER'], task_id)
    os.makedirs(out_path, exist_ok=True)
    out_file = os.path.join(out_path, out_name)

    if target_format in ['jpg', 'jpeg']:
        q = int((100-quality)/5+1) if quality != 100 else 2
        cmd = ['ffmpeg','-i', input_path,'-q:v', str(q), '-y', out_file]
    elif target_format == 'webp':
        cmd = ['ffmpeg','-i', input_path,'-c:v','libwebp','-quality', str(quality), '-compression_level', str(effort), '-y', out_file]
    elif target_format == 'avif':
        cmd = ['ffmpeg','-i', input_path,'-c:v','libaom-av1','-crf', str(40 - int(quality/5)), '-y', out_file]
    else:
        cmd = ['ffmpeg','-i', input_path,'-q:v', str(int((100-quality)/5+1)), '-y', out_file]

    try:
        result = subprocess.run(cmd, capture_output=True)
        if result.returncode == 0:
            orig_size = os.path.getsize(input_path)
            new_size = os.path.getsize(out_file)
            return jsonify({'success': True, 'filename': out_name, 'download_url': f'/api/get_file/converted/{task_id}/{out_name}', 'original_size': orig_size, 'new_size': new_size})
        return jsonify({'error': 'Erreur compression'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ─── API : SERVE FILES (avec suppression automatique) ─────────────────────────
@app.route('/api/get_file/<folder>/<task_id>/<filename>')
def get_file(folder, task_id, filename):
    folder_map = {
        'downloads': app.config['DOWNLOAD_FOLDER'],
        'converted': app.config['CONVERTED_FOLDER'],
    }
    base = folder_map.get(folder)
    if not base:
        abort(404)
    path = os.path.join(base, task_id, filename)
    if not os.path.exists(path):
        abort(404)

    @after_this_request
    def remove_file(response):
        try:
            os.remove(path)
            parent = os.path.dirname(path)
            try:
                os.rmdir(parent)
            except OSError:
                pass
        except Exception as e:
            app.logger.error(f"Erreur suppression fichier {path}: {e}")
        return response

    return send_file(path, as_attachment=True)

@app.route('/sw.js')
def service_worker():
    return send_file('static/js/sw.js', mimetype='application/javascript')

@app.route('/donate')
def donate_page():
    return render_template('donate.html')
    
@app.route('/crypto')
def crypto_page():
    return render_template('crypto.html')
    
@app.route('/ping')
def ping():
    return "OK", 200
   
# ─── NETTOYAGE AUTOMATIQUE DES FICHIERS OBSOLÈTES ────────────────────────────
def clean_old_files():
    """Supprime les fichiers plus vieux que FILE_RETENTION_SECONDS dans les dossiers de travail."""
    now = time.time()
    folders = [app.config['UPLOAD_FOLDER'], app.config['DOWNLOAD_FOLDER'], app.config['CONVERTED_FOLDER']]
    for folder in folders:
        if not os.path.exists(folder):
            continue
        for root, dirs, files in os.walk(folder, topdown=False):
            for file in files:
                filepath = os.path.join(root, file)
                try:
                    if os.path.getmtime(filepath) < now - FILE_RETENTION_SECONDS:
                        os.remove(filepath)
                except Exception:
                    pass
            for d in dirs:
                try:
                    os.rmdir(os.path.join(root, d))
                except OSError:
                    pass

def cleaner_loop():
    """Boucle infinie de nettoyage."""
    while True:
        time.sleep(FILE_RETENTION_SECONDS)
        clean_old_files()

def start_cleaner():
    """Démarre le thread de nettoyage en arrière-plan."""
    thread = threading.Thread(target=cleaner_loop, daemon=True)
    thread.start()

# ─── SOCKETIO ─────────────────────────────────────────────────────────────────
@socketio.on('connect')
def on_connect():
    emit('connected', {'status': 'ok'})
    
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    start_cleaner()
    socketio.run(app, host='0.0.0.0', port=port)