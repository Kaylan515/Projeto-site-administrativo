"""Run the Node built-in tests without installing frontend dependencies."""
from pathlib import Path
import shutil
import subprocess
import pytest


@pytest.mark.parametrize('script', ['pdv.test.cjs', 'navigation.test.cjs'])
def test_javascript(script):
    node = shutil.which('node')
    if not node:
        pytest.skip('Node.js precisa estar instalado para os testes JavaScript')
    root = Path(__file__).resolve().parents[1]
    result = subprocess.run([node, '--test', str(root / 'tests' / 'js' / script)], cwd=root, capture_output=True, text=True, timeout=30)
    assert result.returncode == 0, result.stdout + result.stderr
