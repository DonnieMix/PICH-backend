# PICH Backend

Welcome to the backend service of the **PICH Project**. This service is built using [NestJS](https://nestjs.com/), a progressive Node.js framework, and is designed to handle the core business logic, API endpoints, and database interactions for the PICH application.

## 🚀 Features

* Modular architecture with NestJS for scalability and maintainability.
* Integration with PostgreSQL using Prisma ORM for type-safe database operations.
* Dockerized environment for consistent development and deployment workflows.
* Comprehensive testing setup to ensure code reliability.


## 🛠️ Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v14 or higher)
* [Yarn](https://yarnpkg.com/)
* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/PICH-Project/PICH-backend.git
   cd PICH-backend
   ```



2. **Install dependencies:**

   ```bash
   yarn install
   ```



3. **Set up environment variables:**

   Create a `.env` file in the root directory and configure the necessary environment variables.

4. **Run the application with Docker:**

   ```bash
   yarn dev
   ```



This command will start the Docker containers and run the backend service.

5. **Stop the application:**

   ```bash
   yarn stop
   ```



## 🧪 Running Tests

To execute the test suites:

```bash
yarn test
```



Ensure that the necessary environment variables are set up and the database is accessible before running tests.

## 📄 API Documentation

API documentation is available and can be accessed once the application is running. Navigate to `http://localhost:3000/api` to view the Swagger UI with all available endpoints and their specifications.

## 📦 Deployment

For deployment, ensure that the environment variables are correctly configured for the production environment. Build the application using:

```bash
yarn build
```



Then, start the application with:

```bash
yarn start:prod
```


Docker can also be used to manage the production deployment.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

For more information and updates, please visit the [PICH Project GitHub Organization](https://github.com/PICH-Project).

---
