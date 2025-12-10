# TayLabs/Keys

Service for managing and validating API keys

This service depends on the following:

- Postgres DB
- Redis
- [TayLabs/Auth (Express SDK)](https://github.com/TayLabs/Auth_Express) (This is only needed indirectly for the management routes, the service can independantly validate access tokens for users. It is best to host the Auth service alongside however for obtaining this access token easily)
