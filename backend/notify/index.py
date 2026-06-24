import json
import smtplib
import os
# v2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def handler(event: dict, context) -> dict:
    """Отправляет email с выбором пользователя (место и дата)"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = json.loads(event.get('body', '{}'))
    place = body.get('place', '—')
    date = body.get('date', '—')

    smtp_password = os.environ['SMTP_PASSWORD']
    from_email = 'sandar.k128@mail.ru'
    to_email = 'sandar.k128@mail.ru'

    msg = MIMEMultipart('alternative')
    msg['Subject'] = '💕 Лиза выбрала место и дату!'
    msg['From'] = from_email
    msg['To'] = to_email

    html = f"""
    <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 30px;">
        <h1 style="color: #c0435a; text-align: center;">💕 Лиза согласилась!</h1>
        <div style="background: #fff5f7; border-radius: 16px; padding: 24px; margin-top: 20px;">
            <p style="font-size: 18px; margin-bottom: 12px;">📍 <strong>Место:</strong> {place}</p>
            <p style="font-size: 18px;">📅 <strong>Дата:</strong> {date}</p>
        </div>
        <p style="text-align: center; color: #b07080; margin-top: 20px; font-size: 14px;">🌸 Ждём не дождёмся! 🌸</p>
    </div>
    """

    msg.attach(MIMEText(html, 'html'))

    with smtplib.SMTP_SSL('smtp.mail.ru', 465) as server:
        server.login(from_email, smtp_password)
        server.sendmail(from_email, to_email, msg.as_string())

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }