// Refresh the OAuth token if necessary

const moment = require('moment')

//constent to store the names of environment variables
const ACCESS_TOKEN_KEY = "OAuth_Token";//
const EXPIRY_ACCESS_TOKEN_KEY = "AccessTokenExpiry";

//collection varables
const AUTH_URL_KEY = "Auth_Url";//the url where you can get the token
const CLIENT_ID_KEY = "client_id";
const CLIENT_SECRET_KEY = "client_secret";



//check if we have valid token and not expiry
//if token is valid don't do enything else request new token
if (!_.has(pm.environment.toObject(), EXPIRY_ACCESS_TOKEN_KEY)
    || !_.has(pm.environment.toObject(), ACCESS_TOKEN_KEY)
    || pm.environment.get(EXPIRY_ACCESS_TOKEN_KEY) <= moment().valueOf()) {



    //get client_id and client_secret 
    const client_id = pm.variables.get(CLIENT_ID_KEY);
    const client_secret = pm.variables.get(CLIENT_SECRET_KEY);

    //encode (client_id:client_secret) base64
    const basic_auth_base64 = btoa(`${client_id}:${client_secret}`);

    //prepare the request
    const getNewToken = {
        url: pm.variables.get(AUTH_URL_KEY),
        method: 'POST',
        header: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basic_auth_base64}`
        },
        body: {
            mode: 'urlencoded',
            urlencoded: [
                { key: 'grant_type', value: 'client_credentials' }
            ]
        }
    }

    //send the request
    pm.sendRequest(getNewToken, (err, res) => {
        if (err === null) {
            try {
                //save access_token and expires_in in env variable
                pm.environment.set(ACCESS_TOKEN_KEY, res.json().access_token)

                var expiryDate = moment().add(res.json().expires_in, 's').valueOf()
                pm.environment.set(EXPIRY_ACCESS_TOKEN_KEY, expiryDate)
            } catch (e) {
                console.log('Unable to load access token from response');
                console.log(e);
            }
        } else {
            console.log('Unable to load access token from response');
            console.log(err);
        }
    })

}