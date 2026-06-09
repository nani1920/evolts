/** @format */

const validate = (schema) => (req, res, next) => {
  const results = schema.safeParse(req.body);

  if (!results.success) {
    return res.status(400).json({
      success: false,
      errors: results.error.flatten(),
    });
  }
  req.body = results.data;
  next();
};

const validateParams = (schema) => (req, res, next) => {
  const results = schema.safeParse(req.params);

  if (!results.success) {
    return res.status(400).json({
      success: false,
      errors: results.error.flatten(),
    });
  }
  req.params = results.data;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const results = schema.safeParse(req.query);

  if (!results.success) {
    return res.status(400).json({
      success: false,
      errors: results.error.flatten(),
    });
  }
  req.query = results.data;
  next();
};

module.exports = {
  validate,
  validateParams,
  validateQuery,
};
