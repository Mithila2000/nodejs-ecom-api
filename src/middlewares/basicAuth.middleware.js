import UserModel from "../features/user/user.model.js";

const basicAuthorizer = (req, res, next) => {
    // 1. Check if authorization header is empty
    const authHeader = req.header("authorization");
    if(!authHeader) {
        return res.status(401).send("No authorization details found")   // 401  - unauthorized req
    }
    console.log(authHeader)

    // 2. Extract credentials [Basic asihwjdh36934049jdksjdndxw]
    const base64Credentials = authHeader.replace('Basic ', '');

    // 3. Decode Credentials 
    const decodedCreds = Buffer.from(base64Credentials, 'base64').toString('utf8')
    console.log(decodedCreds)  // [username: password]
    const creds = decodedCreds.split(':');   // creds is an array

    const user = UserModel.getAll().find(u => u.email == creds[0] && u.password == creds[1]);
    if(user) {
        next();
    }
    else {
        return res.status(401).send("Incorrect Credentials");
    }
}

export default basicAuthorizer