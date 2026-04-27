# Subsonic Search Service

A Ktor-based microservice that provides a simplified search interface for Subsonic-compatible servers (like Navidrome).

## Prerequisites

- **Java 17** or higher
- **1Password CLI (`op`)** for environment variable management
- A Subsonic-compatible server (e.g., [Navidrome](https://www.navidrome.org/))

## Configuration

The service requires the following environment variables:

- `SUBSONIC_URL`: The full URL to your server (e.g., `https://music.pattyjog.al`)
- `SUBSONIC_USER`: Your username
- `SUBSONIC_PASS`: Your password or API token

These should be defined in a `.env` file (see `.env.tpl`).

## Running the Service

To run the service with environment variables loaded from 1Password:

```bash
op run --env-file .env.tpl -- ./gradlew run
```

The server will start on **port 8080**.

## Testing the API

Once the service is running, you can search for songs using the `/search` endpoint:

```bash
curl "http://localhost:8080/search?q=your_search_query"
```

## Troubleshooting

- **Logs**: The service is configured with Logback. Check the terminal output for detailed request traces and upstream error messages.
- **Port Conflicts**: If the server fails to start, check if another process is using port 8080 (`lsof -i :8080`).
- **Navidrome**: Ensure the "Allow Subsonic" permission is enabled for your user in the Navidrome settings.
