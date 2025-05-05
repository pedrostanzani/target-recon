import socket
from ipaddress import ip_network
import errno
from typing import List, Optional

from models import PortResult


class PortScanner:
    def __init__(self, timeout: float = 1.0):
        self.timeout = timeout

    @staticmethod
    def get_service_name(port: int, protocol: str = 'tcp') -> str:
        try:
            return socket.getservbyport(port, protocol)
        except OSError:
            return "unknown"

    @staticmethod
    def identify_os(banner: str) -> str:
        bl = banner.lower()
        if "windows" in bl:
            return "Windows"
        if any(k in bl for k in ("ubuntu", "debian", "centos", "fedora", "linux")):
            return "Linux"
        if "freebsd" in bl:
            return "FreeBSD"
        if "openbsd" in bl:
            return "OpenBSD"
        if any(k in bl for k in ("ios", "macos", "darwin")):
            return "Mac OS"
        return "Unknown"

    def _scan_tcp(self, ip: str, port: int, print_closed: bool, print_filtered: bool) -> Optional[PortResult]:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(self.timeout)
        code = sock.connect_ex((ip, port))
        banner = ""
        status = None
        error_code = None
        if code == 0:
            status = "open"
            try:
                banner = sock.recv(1024).decode(errors="ignore").strip()
            except socket.timeout:
                pass
        elif code == errno.ECONNREFUSED and print_closed:
            status = "closed"
        elif code == errno.ETIMEDOUT and print_filtered:
            status = "filtered"
        elif code not in (0, errno.ECONNREFUSED, errno.ETIMEDOUT):
            status = "unknown"
            error_code = code
        sock.close()
        if status is None:
            return None
        service = self.get_service_name(port, 'tcp')
        os_info = self.identify_os(banner) if banner else "Unknown"
        return PortResult(
            ip=ip, port=port, protocol="tcp", status=status,
            service=service, os_info=os_info, banner=banner,
            error_code=error_code
        )

    def _scan_udp(self, ip: str, port: int, print_closed: bool, print_filtered: bool) -> Optional[PortResult]:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(self.timeout)
        try:
            sock.sendto(b'', (ip, port))
            banner = ""
            status = None
            try:
                data, _ = sock.recvfrom(1024)
                banner = data.decode(errors="ignore").strip()
                status = "open"
            except socket.timeout:
                if print_filtered:
                    status = "open|filtered"
            sock.close()
            if not status:
                return None
            service = self.get_service_name(port, 'udp')
            os_info = self.identify_os(banner) if banner else "Unknown"
            return PortResult(
                ip=ip, port=port, protocol="udp", status=status,
                service=service, os_info=os_info, banner=banner
            )
        except socket.error as e:
            if e.errno == errno.ECONNREFUSED and print_closed:
                return PortResult(ip=ip, port=port, protocol="udp", status="closed")
            return PortResult(ip=ip, port=port, protocol="udp", status="error", error_message=str(e))

    def scan(self, target: str, start_port: int, end_port: int,
             protocol: str, print_closed: bool, print_filtered: bool) -> List[PortResult]:
        proto = protocol.lower()
        if proto not in ('tcp', 'udp'):
            raise ValueError("Protocol inválido; use 'tcp' ou 'udp'.")
        # hosts expansion
        if '/' in target:
            network = ip_network(target, strict=False)
            hosts = [str(h) for h in network.hosts()]
        else:
            hosts = [target]
        results: List[PortResult] = []
        for ip in hosts:
            for port in range(start_port, end_port + 1):
                if proto == 'tcp':
                    res = self._scan_tcp(
                        ip, port, print_closed, print_filtered)
                else:
                    res = self._scan_udp(
                        ip, port, print_closed, print_filtered)
                if res:
                    results.append(res)
        return results
