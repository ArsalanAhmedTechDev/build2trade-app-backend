// const Joi = require('joi');
// const httpStatus = require('http-status');
// const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
//
// const validate = (schema) => (req, res, next) => {
//     const validSchema = pick(schema, ['params', 'query', 'body']);
//     const object = pick(req, Object.keys(validSchema));
//     const { value, error } = Joi.compile(validSchema)
//         .prefs({ errors: { label: 'key' }, abortEarly: false })
//         .validate(object);
//
//     if (error) {
//         const errorMessage = error.details.map((details) => details.message).join(', ');
//         return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
//     }
//     Object.assign(req, value);
//     return next();
// };
//
// const objectId = (value, helpers) => {
//     if (!value.match(/^[0-9a-fA-F]{24}$/)) {
//         return helpers.message('"{{#label}}" must be a valid mongo id');
//     }
//     return value;
// };
//
// const password = (value, helpers) => {
//     if (value.length < 8) {
//         return helpers.message('password must be at least 8 characters');
//     }
//     if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
//         return helpers.message('password must contain at least 1 letter and 1 number');
//     }
//     return value;
// };
//
// module.exports = {
//     objectId,
//     password,
//     validate
// };
