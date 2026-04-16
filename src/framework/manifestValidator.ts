import Ajv from 'ajv'
import schema from '../../manifest.schema.json'

const ajv = new Ajv({ allErrors: true })
export const validateManifest = ajv.compile(schema)