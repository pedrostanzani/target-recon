1. Além do PortScan, quais são as 5 ferramentas mais úteis para reconhecimento em um pentest?
    - Justifique cada escolha com base em casos reais (ex: Shodan para IoT, theHarvester para e-mails).

As 5 ferramentas mais úteis para reconhecimento em um pentest além do pentest são:
- Shodan para mapear IoT e câmeras expostas.
- theHarvester para coletar e-mails e subdomínios visando phishing.
- Recon-ng para automatizar consultas OSINT em diversas APIs.
- OWASP Amass para descobrir subdomínios ocultos via DNS e certificados.
- Censys para indexar banners e certificados TLS e rastrear mudanças.

---

2. Qual a diferença entre um scanner de portas SYN e um TCP Connect Scan?

O SYN Scan realiza um handshake “meia-aberto”: ele envia um SYN, espera o SYN/ACK e interrompe com um RST. Isso torna o SYN Scan mais furtivo, rápido e discreto em redes internas; já o TCP Connect Scan utiliza diretamente a chamada connect() do sistema operacional para completar o handshake, sendo mais detectável, porém capaz de rodar sem privilégios de root e compatível com IPv6.

---

3. Como um pentester pode evitar ser detectado por sistemas de prevenção de intrusão (IPS) durante o reconhecimento?
    - Liste técnicas e como elas impactam a eficácia do scan.

Um pentester poderia evitar ser detectado usando reconhecimento passivo para gerar pouco tráfego e evitar alertas do IPS, mas isso vai trazer menos informações úteis. Também poderia: fragmentar pacotes, adotar timing lento (–T0/T1) ou usar decoys. Essas são estratégais que ajudam a driblar assinaturas e confundir logs. O idle scan recorre a máquinas zumbi para mascarar a origem, mas só funciona se houver hosts vulneráveis disponíveis.