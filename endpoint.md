# Especificação Técnica de Endpoints e Integração de APIs - FrotaGo Angola

Documento oficial de especificação técnica de todas as rotas e contratos de comunicação REST, WebSockets, Webhooks e Object Storage esperados pelo frontend de **Gestão de Frotas de Táxis e Moto-Táxis (FrotaGo)**.

---

## 📦 Arquitetura das APIs do Projeto

```
                     ┌──────────────────────────────────────────┐
                     │           FRONTEND REACT TS              │
                     │          (Painel FrotaGo Web)            │
                     └──────┬───────────────┬────────────────┬──┘
                            │               │                │
            ┌───────────────▼┐      ┌───────▼────────┐      ┌▼─────────────────┐
            │   API 1: AUTH  │      │  API 2: MINIO  │      │   API 3: CORE    │
            │  (Golang JWT)  │      │ (Mídias/Fotos) │      │ (Frota/Despacho) │
            │  github repo:  │      │  github repo:  │      │  (WebSockets +   │
            │  graaalberto/  │      │  graaalberto/  │      │   PostgreSQL)    │
            │golang-auth-api │      │golang-minio-api│      └──────────────────┘
            └────────────────┘      └────────────────┘
```

### Repositórios Prontos Fornecidos:
1. **Autenticação & Utilizadores:** [`https://github.com/graaalberto/graaa-golang-auth-api`](https://github.com/graaalberto/graaa-golang-auth-api)
2. **Gerenciamento de Arquivos & Mídias MinIO:** [`https://github.com/graaalberto/graaa-golang-minio-api-file`](https://github.com/graaalberto/graaa-golang-minio-api-file)

---

## Índice das APIs
1. [API 1: Autenticação & Usuários (`graaa-golang-auth-api`)](#1-api-de-autenticação--utilizadores-graaa-golang-auth-api)
2. [API 2: Mídias e Arquivos com MinIO (`graaa-golang-minio-api-file`)](#2-api-de-mídias-e-arquivos-com-minio-graaa-golang-minio-api-file)
3. [API 3: Backend Central da Frota & Telemetria em Tempo Real](#3-api-central-da-frota--telemetria-em-tempo-real)
4. [API 4: Mapas, Geocodificação & Roteamento (Google Maps / Mapbox)](#4-api-de-mapas-geocodificação--roteamento)
5. [API 5: Gateway de Pagamentos (Multicaixa Express / EMIS / Stripe)](#5-api-de-gateway-de-pagamentos)
6. [API 6: Notificações, SMS & WhatsApp (Twilio / Z-API / FCM)](#6-api-de-notificações-sms--whatsapp)
7. [API 7: Ingestão de Telemetria IoT & Rastreadores GPS Físicos](#7-api-de-ingestão-de-telemetria-iot)

---

## 1. API de Autenticação & Utilizadores (`graaa-golang-auth-api`)

* **Repositório:** `https://github.com/graaalberto/graaa-golang-auth-api`
* **Porta padrão local:** `http://localhost:8080`

### 1.1 Registo de Novo Utilizador
* **Método:** `POST`
* **Rota:** `/api/register`
* **Headers:** `Content-Type: application/json`
* **Corpo da Requisição (Payload):**
```json
{
  "name": "João dos Santos",
  "email": "joao.santos@frotago.ao",
  "password": "SenhaSegura@2026",
  "role": "admin", // "admin" | "fleet_manager" | "dispatcher" | "driver"
  "phone": "+244 923 100 200"
}
```
* **Resposta de Sucesso (201 Created):**
```json
{
  "status": "success",
  "message": "Utilizador registado com sucesso",
  "data": {
    "user": {
      "id": "usr_991823",
      "name": "João dos Santos",
      "email": "joao.santos@frotago.ao",
      "role": "admin",
      "phone": "+244 923 100 200",
      "createdAt": "2026-08-16T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "d8a1f8e9-234b-48c9-bc1a-12908f9024ab"
    }
  }
}
```

### 1.2 Login de Utilizador
* **Método:** `POST`
* **Rota:** `/api/login`
* **Headers:** `Content-Type: application/json`
* **Corpo da Requisição:**
```json
{
  "email": "joao.santos@frotago.ao",
  "password": "SenhaSegura@2026"
}
```
* **Resposta de Sucesso (200 OK):**
```json
{
  "status": "success",
  "message": "Autenticado com sucesso",
  "data": {
    "user": {
      "id": "usr_991823",
      "name": "João dos Santos",
      "email": "joao.santos@frotago.ao",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "d8a1f8e9-234b-48c9-bc1a-12908f9024ab"
    }
  }
}
```

### 1.3 Obter Perfil do Utilizador Autenticado
* **Método:** `GET`
* **Rota:** `/api/me`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Resposta de Sucesso (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "usr_991823",
      "name": "João dos Santos",
      "email": "joao.santos@frotago.ao",
      "role": "admin",
      "phone": "+244 923 100 200",
      "avatar": "https://minio.frotago.ao/avatars/usr_991823.jpg",
      "twoFactorEnabled": false
    }
  }
}
```

### 1.4 Renovação de Token (Refresh Token)
* **Método:** `POST`
* **Rota:** `/api/refresh`
* **Corpo:** `{ "refreshToken": "d8a1f8e9-234b-48c9-bc1a-12908f9024ab" }`

---

## 2. API de Mídias e Arquivos com MinIO (`graaa-golang-minio-api-file`)

* **Repositório:** `https://github.com/graaalberto/graaa-golang-minio-api-file`
* **Porta padrão local:** `http://localhost:8081` ou `http://localhost:9000` (MinIO Server)
* **Objetivo:** Armazenar fotos e arquivos pesados fora do PostgreSQL, organizados em **Buckets**.

### Buckets Recomendados para o FrotaGo:
1. `avatars`: Fotos de perfil dos motoristas e administradores.
2. `vehicles`: Fotos dos carros, motas, livretes e apólices de seguro.
3. `breakdowns`: Fotos mecânicas de peças danificadas, avarias e recibos de oficinas.
4. `stops`: Fotos de comprovativos enviados por motoristas durante paragens (ex.: recibo da bomba de combustível ou blitz).
5. `documents`: Cópias de cartas de condução, registos criminais e relatórios em PDF.

### 2.1 Upload de Arquivo (Multipart Form-Data)
* **Método:** `POST`
* **Rota:** `/api/files/upload`
* **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
* **Form-Data Params:**
  - `file`: Arquivo binário (JPG, PNG, PDF, WEBP)
  - `bucket`: `avatars` | `vehicles` | `breakdowns` | `stops` | `documents`
* **Resposta de Sucesso (201 Created):**
```json
{
  "status": "success",
  "message": "Arquivo enviado com sucesso para o MinIO",
  "data": {
    "fileId": "file_89214710",
    "fileName": "avaria_motor_LD4412FK.jpg",
    "bucket": "breakdowns",
    "fileUrl": "http://localhost:8081/api/files/breakdowns/avaria_motor_LD4412FK.jpg",
    "sizeBytes": 1420580,
    "mimeType": "image/jpeg",
    "uploadedAt": "2026-08-16T15:20:00Z"
  }
}
```

### 2.2 Download / Visualização de Arquivo
* **Método:** `GET`
* **Rota:** `/api/files/:bucket/:fileName`
* **Resposta:** Stream binário da imagem ou documento (com cabeçalhos de cache e `Content-Type`).

### 2.3 Gerar URL Pré-Assinada Segura (Presigned URL)
* **Método:** `POST`
* **Rota:** `/api/files/presigned-url`
* **Corpo:**
```json
{
  "bucket": "documents",
  "fileName": "carta_conducao_drv01.pdf",
  "expiresInSeconds": 3600
}
```
* **Resposta:**
```json
{
  "status": "success",
  "presignedUrl": "http://localhost:9000/documents/carta_conducao_drv01.pdf?X-Amz-Signature=..."
}
```

### 2.4 Excluir Arquivo do MinIO
* **Método:** `DELETE`
* **Rota:** `/api/files/:bucket/:fileName`
* **Headers:** `Authorization: Bearer <token>`

---

## 3. API Central da Frota & Telemetria em Tempo Real

Base URL: `/api`

### 3.1 Gestão de Veículos (Carros e Motas)

#### Listar Veículos
* **Método:** `GET`
* **Rota:** `/api/vehicles`
* **Query Params:** `?type=car_taxi&status=in_trip`
* **Resposta (200 OK):**
```json
[
  {
    "id": "veh_01",
    "plate": "LD-44-12-FK",
    "brand": "Toyota",
    "model": "Hiace (Quadrado)",
    "year": 2021,
    "type": "car_taxi",
    "status": "in_trip",
    "fuelLevel": 78,
    "oilHealth": 85,
    "engineTempC": 88,
    "speedKmH": 48,
    "odometerKm": 68420,
    "driverId": "drv_01",
    "driverName": "António Silva",
    "coordinates": {
      "lat": -8.8146,
      "lng": 13.2301,
      "address": "Mutamba, Luanda"
    },
    "photoUrl": "http://localhost:8081/api/files/vehicles/veh_01.jpg"
  }
]
```

#### Registar Nova Viatura na Frota
* **Método:** `POST`
* **Rota:** `/api/vehicles`
* **Corpo:**
```json
{
  "plate": "LD-99-23-AA",
  "brand": "Suzuki",
  "model": "Haojue 125cc",
  "year": 2023,
  "type": "moto_taxi",
  "driverId": "drv_04",
  "trackerImei": "864201048291048",
  "photoUrl": "http://localhost:8081/api/files/vehicles/moto_9923.jpg"
}
```

---

### 3.2 Despacho de Corridas (Trips)

#### Despachar Nova Corrida Imediata
* **Método:** `POST`
* **Rota:** `/api/trips`
* **Corpo:**
```json
{
  "vehicleId": "veh_01",
  "vehiclePlate": "LD-44-12-FK",
  "passengerName": "Maria Fernandes",
  "passengerPhone": "+244 923 888 777",
  "origin": { "lat": -8.8146, "lng": 13.2301, "address": "Mutamba" },
  "destination": { "lat": -8.9167, "lng": 13.1833, "address": "Talatona" },
  "distanceKm": 14.5,
  "fareAOA": 5550,
  "paymentMethod": "multicaixa_express"
}
```

#### Concluir Corrida
* **Método:** `PATCH`
* **Rota:** `/api/trips/:id/status`
* **Corpo:**
```json
{
  "status": "completed",
  "actualDurationMinutes": 28,
  "rating": 5
}
```

---

### 3.3 Relatórios de Paragens com Comprovativo MinIO

#### Submeter Paragem com Foto da Bomba / Justificação
* **Método:** `POST`
* **Rota:** `/api/stops`
* **Corpo:**
```json
{
  "vehiclePlate": "LD-44-12-FK",
  "driverName": "António Silva",
  "reason": "fuel",
  "description": "Abastecimento no Posto Sonangol da Samba.",
  "photoProofUrl": "http://localhost:8081/api/files/stops/recibo_bomba_8912.jpg",
  "coordinates": { "lat": -8.8412, "lng": 13.2198, "address": "Bomba Sonangol Samba" }
}
```

---

### 3.4 Relatório de Avarias Mecânicas com Foto MinIO

* **Método:** `POST`
* **Rota:** `/api/breakdowns`
* **Corpo:**
```json
{
  "vehiclePlate": "LD-90-AA-11",
  "severity": "critical",
  "category": "engine",
  "description": "Fuga de óleo no bloco do motor.",
  "estimatedCostAOA": 85000,
  "photoUrl": "http://localhost:8081/api/files/breakdowns/bloco_motor_avaria.jpg"
}
```

---

### 3.5 Canal WebSocket de Telemetria ao Vivo

* **Endpoint:** `WS /ws/fleet`
* **Evento de Posição:**
```json
{
  "event": "VEHICLE_POSITION_UPDATE",
  "data": {
    "vehicleId": "veh_01",
    "lat": -8.8152,
    "lng": 13.2315,
    "speedKmH": 52,
    "fuelLevel": 77,
    "oilHealth": 85,
    "engineTempC": 89
  }
}
```

---

## 4. API de Mapas, Geocodificação & Roteamento
* `GET /api/maps/geocode?address=Luanda`
* `POST /api/maps/directions` `{ origin: {...}, destination: {...} }`

## 5. API de Gateway de Pagamentos (Multicaixa Express)
* `POST /api/payments/charge` `{ tripId, amountAOA, customerPhone }`
* `POST /api/payments/webhook` `{ transactionId, status: "PAID" }`

## 6. API de Notificações, SMS & WhatsApp
* `POST /api/notifications/send` `{ channel: "whatsapp", recipientPhone: "+244923...", message: "..." }`

## 7. API de Ingestão de Telemetria IoT
* `POST /api/telemetry/ingest` `{ imei, lat, lng, speed, fuelPercent, oilPercent, tempC }`
