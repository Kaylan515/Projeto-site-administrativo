"""Local static PIX payload and QR generation (no banking API)."""
import base64
import binascii
import io
import os
import unicodedata

import qrcode
from qrcode.image.svg import SvgPathImage


def _field(tag: str, value: str) -> str:
    length = len(value.encode('utf-8'))
    if length > 99:
        raise ValueError('Campo PIX excede o tamanho permitido')
    return f'{tag}{length:02d}{value}'


def _label(value: str, limit: int) -> str:
    normalized = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().upper()
    return ''.join(c for c in normalized if c.isalnum() or c == ' ')[:limit].strip()


def gerar_pix(centavos: int) -> dict:
    key = os.getenv('PIX_KEY', '').strip()
    if not key:
        raise ValueError('A chave PIX ainda nao foi configurada.')
    if type(centavos) is not int or not 0 < centavos <= 99999999999:
        raise ValueError('Informe um valor PIX valido.')
    merchant = _field('00', 'br.gov.bcb.pix') + _field('01', key)
    name = _label(os.getenv('PIX_RECEIVER_NAME', 'AAPM SENAI'), 25) or 'AAPM SENAI'
    city = _label(os.getenv('PIX_RECEIVER_CITY', 'SAO PAULO'), 15) or 'SAO PAULO'
    amount = f'{centavos // 100}.{centavos % 100:02d}'
    payload = (_field('00', '01') + _field('26', merchant) + _field('52', '0000')
               + _field('53', '986') + _field('54', amount) + _field('58', 'BR')
               + _field('59', name) + _field('60', city) + _field('62', _field('05', '***')) + '6304')
    payload += f"{binascii.crc_hqx(payload.encode('utf-8'), 0xFFFF):04X}"
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=4)
    qr.add_data(payload)
    qr.make(fit=True)
    output = io.BytesIO()
    qr.make_image(image_factory=SvgPathImage).save(output)
    image = 'data:image/svg+xml;base64,' + base64.b64encode(output.getvalue()).decode('ascii')
    return {'codigo': payload, 'qr_code': image, 'valor_centavos': centavos}
