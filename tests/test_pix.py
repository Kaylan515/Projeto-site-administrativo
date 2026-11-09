import base64
import binascii
import pytest
from app.services.pix import gerar_pix


def test_pix_contem_chave_valor_crc_e_qr_local(monkeypatch):
    monkeypatch.setenv('PIX_KEY', '12345678909')
    data = gerar_pix(12345)
    payload = data['codigo']
    assert 'br.gov.bcb.pix' in payload
    assert '12345678909' in payload
    assert '5406123.45' in payload
    assert payload.endswith(f"{binascii.crc_hqx(payload[:-4].encode(), 0xFFFF):04X}")
    assert b'<svg' in base64.b64decode(data['qr_code'].split(',', 1)[1])
    assert data['valor_centavos'] == 12345


@pytest.mark.parametrize('valor', [0, -1, 1.5, True, 100000000000])
def test_pix_rejeita_valor_invalido(monkeypatch, valor):
    monkeypatch.setenv('PIX_KEY', '12345678909')
    with pytest.raises(ValueError):
        gerar_pix(valor)


def test_pix_sem_chave(monkeypatch):
    monkeypatch.delenv('PIX_KEY', raising=False)
    with pytest.raises(ValueError):
        gerar_pix(1000)


def test_endpoint_pix(cliente, monkeypatch):
    monkeypatch.setenv('PIX_KEY', '12345678909')
    response = cliente.post('/pdv/pix/qr', data={'valor_centavos': 2500})
    assert response.status_code == 200
    assert response.json()['valor_centavos'] == 2500
    assert '25.00' in response.json()['codigo']
    assert cliente.post('/pdv/pix/qr', data={'valor_centavos': -1}).status_code == 400
