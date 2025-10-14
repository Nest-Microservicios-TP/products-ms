
import 'dotenv/config'
import * as joi from 'joi'


interface EnvVars {
    PORT: number;
    DATABASE_URL: string;
    AUTH_MS_HOST: string;
    AUTH_MS_PORT: number;
    ORDER_MS_HOST: string;
    ORDER_MS_PORT: number;
}


const envsSchema = joi.object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    AUTH_MS_HOST: joi.string().required(),
    AUTH_MS_PORT: joi.number().required(),
    ORDER_MS_HOST: joi.string().required(),
    ORDER_MS_PORT: joi.number().required(),
})
.unknown(true);

const { error, value } = envsSchema.validate(process.env)


if(error){
    throw new Error(`Config validation error: ${error.message}`)
}

const envVars : EnvVars = value;

export const envs = {
    port: envVars.PORT,
    databaseUrl:  envVars.DATABASE_URL,
    auth_ms_host: envVars.AUTH_MS_HOST,
    auth_ms_port: envVars.AUTH_MS_PORT,
    order_ms_host: envVars.ORDER_MS_HOST,
    order_ms_port: envVars.ORDER_MS_PORT,
}