# Laga API Documentation
Laga API is a part of Laga Web Application. Laga is an online learning platform focused on serving tech facility for educational purpose.
## Sign Up

Endpoint: [host]/api/v1/signup
Method: **POST**

Request Body:

```json
{
 "firstname": "Joko",
 "lastname": "Widodo",
 "username": "jokosgans",
 "email": "jokosigma@gmail.xyz",
 "password": "ilovemyfamily"
}
```


Response Success:

Status: 201
```json
{
 "status": "success",
 "message": "User registered successfully",
 "data": {
     "firstname": "Joko",
     "lastname": "Widodo",
     "username": "jokosgans",
     "email": "jokos@gmail.com",
 }
}
```


## Sign In

Endpoint: [host]/api/v1/signin
Method: **POST**

#### Request 

Header:
```
Authorization: Bearer ${access_token}
```

Body:

```json
{
 "username": "jokosgans",
 "password": "ilovemyfamily"
}
```

#### Response

##### Response Success 

Status: 200

Body: 
```json
{
    "status": "success",
    "message": "User successfully login",
    "data": {
        "firstname": "Joko",
        "lastname": "Widodo",
        "username": "jokosgans",
        "email": "jokos@gmail.com",
        "token": "xxxxxx" 
    }
}
```

##### Response Invalid 

Status: 400

Body: 
```json
{
    "status": "invalid",
    "message": "Invalid Field",
    "errors": {
        "username": "Username field is required"
    }
}
```

##### Response Username or Password 

Status: 401

Body: 
```json
{
    "status": "invalid",
    "message": "Wrong username or password",
}
```

## Sign Out

Endpoint: [host]/api/v1/signout
Method: **GET**

#### Request 

Header:
```
Authorization: Bearer ${access_token}
```

#### Response

##### Response Success 

Status: 200

Body: 
```json
{
    "status": "success",
    "message": "User successfully logout",
}
```

##### Response Success 

Status: 401

Body: 
```json
{
    "status": "unauthorized",
    "message": "Missing or invalid token",
}
```

## Users

Endpoint: [host]/api/v1/users?page=1&size=10&sortDir=asc&sortBy=username

Method: **GET**

#### Request 

Header:
```
Authorization: Bearer ${access_token}
```

<table>
    <thead>
        <tr>
            <th>Params</th>
            <th>Functionalities</th>
            <th>Default</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>page</td>
            <td>Determine how many pages will be sent to the client</td>
            <td>0</td>
        </tr>
        <tr>
            <td>size</td>
            <td>Determine how many items will be sent per page</td>
            <td>10</td>
        </tr>
        <tr>
            <td>sortDir</td>
            <td>To determine which the sorting direction for the paginated elements (ASC or DESC)</td>
            <td>ASC</td>
        </tr>
        <tr>
            <td>sortBy</td>
            <td>Determine which field that must be sorted</td>
            <td>username</td>
        </tr>
    </tbody>
</table>
















