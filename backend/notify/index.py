import json
import os
import urllib.request
import urllib.error

CORS = {'Access-Control-Allow-Origin': '*'}


def send_telegram(token: str, chat_id: str, text: str) -> dict:
    req = urllib.request.Request(
        f'https://api.telegram.org/bot{token}/sendMessage',
        data=json.dumps({'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'}).encode(),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=4) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read() or b'{}')


def handler(event: dict, context) -> dict:
    """Присылает в Telegram уведомление о том, какое место и дату выбрала Настя"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                **CORS,
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    body = json.loads(event.get('body') or '{}')
    place = str(body.get('place', '—'))[:300]
    date = str(body.get('date', '—'))[:100]

    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not token or not chat_id:
        print('Telegram secrets are not configured')
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': False, 'error': 'not_configured'})}

    text = (
        '💕 <b>Настя согласилась!</b>\n\n'
        f'📍 <b>Место:</b> {place}\n'
        f'📅 <b>Дата:</b> {date}\n\n'
        '🌸 Ждём не дождёмся! 🌸'
    )
    result = send_telegram(token, chat_id, text)
    if not result.get('ok'):
        print('Telegram error:', result.get('description'))

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({'ok': bool(result.get('ok')), 'error': result.get('description')}),
    }
