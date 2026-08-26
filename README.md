# Dayflow HRMS

## PostgreSQL with Docker

Start the database:

```powershell
docker compose up -d postgres
```

Copy `.env.example` to `.env`, then load the variables in PowerShell and start the backend:

```powershell
Get-Content .env | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { Set-Item -Path "env:$($matches[1])" -Value $matches[2] } }
cd dayflow_hrms_backend
mvn spring-boot:run
```

Start the frontend in another terminal:

```powershell
cd dayflow_hrms_frontend
npm.cmd run dev
```

PostgreSQL is exposed on host port `5433` to avoid clashing with a locally installed database. The backend runs on `http://localhost:8080` by default. Stop the database with `docker compose down`. The data volume is retained; use `docker compose down -v` only when you intentionally want to erase local database data.
