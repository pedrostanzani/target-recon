import requests
import json


def test_portscan():
    url = "http://localhost:8000/scan"
    # Exemplo: escaneia localhost das portas 80 a 82 via TCP
    payload = {
        "target": "127.0.0.1",
        "start_port": 3000,
        "end_port": 8000,
        "protocol": "tcp",
        "print_closed": False,     # agora vai listar portas fechadas (RST)
        "print_filtered": True    # e também as filtradas (timeout)
    }
    print(
        f"Enviando requisição para {url} com payload:\n{json.dumps(payload, indent=2)}")

    response = requests.post(url, json=payload)
    print(f"Status code: {response.status_code}")

    try:
        data = response.json()
    except ValueError:
        print("Resposta não veio em JSON:", response.text)
        return

    print("Resultados do scan:")
    for entry in data:
        print(entry)


if __name__ == "__main__":
    test_portscan()
