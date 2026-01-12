 import jwt from 'jsonwebtoken'
 
 const jwtAuth =(req, res, next) => {
    // 1. Read the token.
    const token = req.headers["authorization"];
    console.log("token=", token);
    // const token = req.cookies["jwtToken"]; - using cookies

    // 2. If no token, return the error
    if(!token) {
        return res.status(401).send('Unauthorized');
    }

    // 3. Check if token is valid
    try {
        const payload = jwt.verify(token, "eNcgQUrCCkm7qTLpqdVtf4yF8ilY8N5a");
        req.userID = payload.userID;
        console.log(payload)
        //5. call next middleware 
        next()
    }
    catch(err) {
        // 4. return error
        return res.status(401).send('Unauthorized')
    }
 }

 export default jwtAuth