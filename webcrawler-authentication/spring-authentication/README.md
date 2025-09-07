# Spring Security Authentication Demo

This project is a demonstration of various authentication mechanisms implemented using Spring Boot and Spring Security. Each authentication method is isolated into its own security filter chain and has its own set of UI pages.

![Application User Interface](images/spring-authentication-ui.png)

## Features

This application showcases the following authentication methods:

-   **HTTP Basic Authentication:** Simple, stateless authentication using the `Authorization` header.
-   **Form-Based Authentication:** Traditional stateful authentication using an HTML form and server-side sessions.
-   **JWT (JSON Web Token) Authentication:** Stateless authentication using a bearer token, suitable for APIs and single-page applications.
-   **OAuth 2.0:** Authentication using an embedded OAuth 2.0 authorization server.

## Getting Started

### Prerequisites

-   Java 17 or later
-   Maven 3.6 or later

### Running the Application

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd spring-authentication
    ```

2.  Build the project using Maven:
    ```bash
    mvn clean install
    ```

3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```

The application will be available at `http://localhost:8087`.

## Authentication Methods

### 1. HTTP Basic Authentication

-   **URL:** `http://localhost:8087/basic/home`
-   **Username:** `user`
-   **Password:** `password`
-   **Testing:**
    ```bash
    curl -u user:password http://localhost:8087/basic/home
    ```

### 2. Form-Based Authentication

-   **URL:** `http://localhost:8087/form/login`
-   **Username:** `user`
-   **Password:** `password`

### 3. JWT (JSON Web Token) Authentication

-   **Login URL:** `http://localhost:8087/jwt/login`
-   **Credentials:** Use `user` and `password` to get a token.
-   **Accessing Protected Resources:** Include the token in the `Authorization` header as a bearer token.
    ```bash
    curl -H "Authorization: Bearer <your-jwt-token>" http://localhost:8087/jwt/home
    ```

### 4. OAuth 2.0

-   **Login URL:** `http://localhost:8087/oauth/login`
-   This implementation uses an embedded OAuth 2.0 authorization server.
-   **Testing:**
    1.  **Get an access token:**
        ```bash
        curl -X POST http://127.0.0.1:8087/oauth2/token \
          -H "Content-Type: application/x-www-form-urlencoded" \
          -H "Authorization: Basic $(echo -n 'Ov23liYtT6CsdOkG4yyJ:87c06876e02e207dc30a196059a470e382a4ba0c' | base64)" \
          -d "grant_type=client_credentials"
        ```
    2.  **Access a protected resource:**
        ```bash
        curl -v 'http://localhost:8087/oauth/home' -H 'Authorization: Bearer <your-access-token>'
        ```


## Shared Resources

The application includes shared resources that can be accessed after authenticating with any of the supported methods.
-   `http://localhost:8087/shared/resource1`
-   `http://localhost:8087/shared/resource2`
