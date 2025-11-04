# WSL2 포트 포워딩 설정 가이드

**작성자**: 이진규
**작성일**: 2025-11-04
**버전**: 1.0

---

## 문제 상황

WSL2에서 실행 중인 Next.js 개발 서버에 외부 네트워크(같은 LAN의 다른 기기)에서 접속이 불가능한 문제

### 원인

- WSL2는 NAT 네트워크를 사용하여 Windows와 분리된 네트워크 환경에서 실행됨
- WSL의 IP 주소(예: 172.21.245.118)는 Windows 호스트 IP(예: 192.168.0.42)와 다름
- 외부 기기는 Windows IP로 접속하지만, 실제 서비스는 WSL IP에서 실행 중

---

## 해결 방법

### 1. Next.js 개발 서버 설정

모든 네트워크 인터페이스에서 접속을 허용하도록 설정

**파일**: `package.json`

```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "start": "next start -H 0.0.0.0"
  }
}
```

**설명**: `-H 0.0.0.0` 옵션으로 모든 IP에서의 접속을 허용

---

### 2. Windows 방화벽 설정

**PowerShell을 관리자 권한으로 실행**

```powershell
# 3000번 포트 인바운드 규칙 추가
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**결과 확인**:
- 방화벽 규칙이 성공적으로 추가되어야 함
- Windows Defender 방화벽 > 고급 설정 > 인바운드 규칙에서 "Next.js Dev Server" 규칙 확인 가능

---

### 3. 포트 포워딩 설정 (핵심)

#### 3-1. 일회성 수동 설정

**PowerShell을 관리자 권한으로 실행**

```powershell
# WSL IP 확인 (WSL 터미널에서 실행)
# wsl: ip addr show eth0 | grep inet
# 또는: wsl hostname -I

# 포트 포워딩 추가
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3000 connectaddress=172.21.245.118 connectport=3000

# 설정 확인
netsh interface portproxy show all
```

**출력 예시**:
```
ipv4 수신 대기:             ipv4에 연결:

주소            포트        주소            포트
--------------- ----------  --------------- ----------
0.0.0.0         3000        172.21.245.118  3000
```

#### 3-2. 자동화 스크립트 (권장)

WSL IP는 재부팅할 때마다 변경될 수 있으므로 자동화 스크립트 사용을 권장합니다.

**파일 생성**: `C:\Scripts\wsl-port-forward.ps1`

```powershell
# WSL IP 자동 감지 및 포트 포워딩 설정 스크립트

# WSL IP 가져오기
$wslIP = (wsl hostname -I).Trim()

if ([string]::IsNullOrWhiteSpace($wslIP)) {
    Write-Host "Error: WSL IP를 가져올 수 없습니다. WSL이 실행 중인지 확인하세요." -ForegroundColor Red
    exit 1
}

Write-Host "WSL IP 감지: $wslIP" -ForegroundColor Green

# 기존 포트 포워딩 규칙 삭제 (에러 무시)
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=3000 2>$null

# 새로운 포트 포워딩 규칙 추가
$result = netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3000 connectaddress=$wslIP connectport=3000

if ($LASTEXITCODE -eq 0) {
    Write-Host "포트 포워딩 설정 완료: 0.0.0.0:3000 -> $wslIP:3000" -ForegroundColor Green
} else {
    Write-Host "포트 포워딩 설정 실패" -ForegroundColor Red
    exit 1
}

# 현재 포트 포워딩 규칙 표시
Write-Host "`n현재 포트 포워딩 규칙:" -ForegroundColor Yellow
netsh interface portproxy show all
```

**스크립트 실행 방법**:
```powershell
# PowerShell을 관리자 권한으로 실행 후
C:\Scripts\wsl-port-forward.ps1
```

**Windows 시작 시 자동 실행 설정** (선택사항):
1. 작업 스케줄러 열기
2. 새 작업 만들기
3. 트리거: 로그온 시
4. 동작: PowerShell.exe, 인수: `-ExecutionPolicy Bypass -File C:\Scripts\wsl-port-forward.ps1`
5. 최고 권한으로 실행 체크

---

### 4. 포트 포워딩 삭제 (필요시)

```powershell
# 특정 포트 포워딩 규칙 삭제
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=3000

# 모든 포트 포워딩 규칙 삭제
netsh interface portproxy reset
```

---

## 접속 테스트

### 1. 같은 LAN의 다른 기기에서 접속

```
http://192.168.0.42:3000
```

### 2. WSL 내부에서 접속

```bash
curl http://localhost:3000
```

### 3. Windows에서 접속

```
http://localhost:3000
http://192.168.0.42:3000
```

---

## 트러블슈팅

### 포트 포워딩 확인

```powershell
netsh interface portproxy show all
```

출력이 없거나 규칙이 없으면 포트 포워딩이 설정되지 않은 것입니다.

### WSL IP 확인

**WSL 터미널**:
```bash
ip addr show eth0 | grep inet
# 또는
hostname -I
```

**Windows PowerShell**:
```powershell
wsl hostname -I
```

### 방화벽 규칙 확인

```powershell
Get-NetFirewallRule -DisplayName "Next.js Dev Server"
```

### 포트 사용 확인

**WSL 터미널**:
```bash
netstat -tuln | grep 3000
```

**Windows PowerShell**:
```powershell
netstat -an | findstr :3000
```

### 일반적인 문제

**1. 여전히 접속 안 됨**
- Windows 재부팅 후 WSL IP가 변경되었을 가능성
- 자동화 스크립트 실행하여 새 IP로 포트 포워딩 재설정

**2. WSL이 시작되지 않음**
```powershell
wsl --shutdown
wsl
```

**3. 권한 오류**
- PowerShell을 반드시 관리자 권한으로 실행

**4. 방화벽 차단**
- Windows Defender 방화벽에서 해당 포트가 허용되었는지 확인
- 타사 방화벽 소프트웨어도 확인

---

## 참고 사항

### 보안

- 개발 환경에서만 사용하세요
- 프로덕션 환경에서는 적절한 보안 설정이 필요합니다
- 공용 네트워크에서는 포트 포워딩을 비활성화하는 것을 권장합니다

### WSL2 네트워크 구조

```
외부 기기 (192.168.0.x)
    ↓
Windows Host (192.168.0.42)
    ↓ 포트 포워딩 (netsh)
WSL2 (172.21.245.118)
    ↓
Next.js Dev Server (3000)
```

### 다른 포트 추가

다른 포트(예: 8080)도 동일한 방법으로 포워딩 가능:

```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8080 connectaddress=$wslIP connectport=8080
```

---

## 요약

| 단계 | 명령어 | 설명 |
|-----|--------|------|
| 1 | `next dev -H 0.0.0.0` | Next.js 서버를 모든 IP에서 접근 가능하도록 설정 |
| 2 | `New-NetFirewallRule ...` | Windows 방화벽에 인바운드 규칙 추가 |
| 3 | `netsh interface portproxy add ...` | Windows에서 WSL로 포트 포워딩 |
| 4 | `http://192.168.0.42:3000` | 외부 기기에서 접속 테스트 |

---

## 관련 문서

- [Next.js CLI 문서](https://nextjs.org/docs/api-reference/cli)
- [WSL2 네트워킹 공식 문서](https://docs.microsoft.com/en-us/windows/wsl/networking)
- [Windows Netsh 명령어 문서](https://docs.microsoft.com/en-us/windows-server/networking/technologies/netsh/netsh-contexts)
