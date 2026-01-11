<h1 align="center">Welcome to CodersCamp_MiniKino_Backend 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-2.1.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/npm-10.7.0-blue.svg" />
  <img src="https://img.shields.io/badge/node-20.14.0-blue.svg" />
  <a href="https://github.com/kzoglo/CodersCamp_MiniKino_Backend#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/kzoglo/CodersCamp_MiniKino_Backend/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/kzoglo/CodersCamp_MiniKino_Backend/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-yellow.svg" />
  </a>
  <img alt="Coverage: 99.34%" src="https://img.shields.io/badge/coverage-99.34%25-brightgreen" />
</p>

> Written in NodeJS REST API for the CodersCamp_MiniKino_Frontend project. It serves user creation, logging system, tickets reservations and admin routes, like movies creation. Server is connected with MongoDB. It uses expressJS and mongoose.

### 🏠 [Homepage](https://kzoglo.github.io/CodersCamp_MiniKino_Backend)

## Recent Updates

Recent updates (v2.1.0) include:
- Full Docker containerization with optimized multi-stage builds
- AWS S3 implementation for file storage
- GitHub Actions CI/CD workflows
- Docker Compose setup for development and testing environments
- Improved dependency management and layer caching
- Code formatting with Prettier

## Prerequisites

- Docker and Docker Compose
- npm 10.7.0
- node 20.14.0

## Install

```sh
npm install
```

## Usage

### Development Environment (Docker)

```sh
npm start
```

This starts the full development environment with:

- API server on `http://localhost:3001`
- MongoDB on `localhost:27018`
- MinIO on `http://localhost:9000` (console: `http://localhost:9001`)

## Run Tests

```sh
npm test
```

This automatically builds test containers, runs tests inside Docker, and cleans up.

## Docker Commands

- `npm start` - Start development environment
- `npm test` - Run tests in Docker containers

## Author

👤 **Kamil Żogło**

- Github: [@kzoglo](https://github.com/kzoglo)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/kzoglo/CodersCamp_MiniKino_Backend/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2020 [Kamil Żogło](https://github.com/kzoglo).<br />
This project is [MIT](https://github.com/kzoglo/CodersCamp_MiniKino_Backend/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
