const Joi = require("joi");

const registerValid = (data) => {
  const userSchema = Joi.object({
    email: Joi.string()
      .min(6)
      .max(50)
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(8).max(255).required(),
    confirm_password: Joi.ref("password"),
    username: Joi.string().max(20).required(),
    avatar: Joi.string().max(255).allow(null, "")
  });

  return userSchema.validate(data);
};
const loginValid = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .min(6)
      .max(50)
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(8).max(255).required()
  });
  return schema.validate(data);
};
const cardDataValid = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(30).required(),
    is_public: Joi.number().valid(0, 1).required(),
    image_url: Joi.string().uri().required(),
    public_id: Joi.string().required()
  });
  return schema.validate(data);
};

const updateProfileValid = (data, isChangePw) => {
  const schema = Joi.object({
    username: Joi.string().max(20).required(),
    avatar: Joi.string().max(255).allow(null, ""),
    isChangePassword: Joi.boolean().required(),
    ...(isChangePw && {
      new_password: Joi.string().min(8).max(255).required(),
      confirm_new_password: Joi.ref("new_password")
    })
  });
  return schema.validate(data);
};

const cardDataUpdateValid = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(30),
    is_public: Joi.number().valid(0, 1),
    image_url: Joi.string().uri(),
    public_id: Joi.string()
  });
  return schema.validate(data);
};
const emailValid = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .min(6)
      .max(50)
      .email({ tlds: { allow: false } })
      .required()
  });
  return schema.validate(data);
};
const resetPwValid = (data) => {
  const schema = Joi.object({
    reset_token: Joi.string().required(),
    new_password: Joi.string().min(8).max(255).required(),
    confirm_new_password: Joi.ref("new_password")
  });
  return schema.validate(data);
};

module.exports = {
  registerValid,
  loginValid,
  cardDataValid,
  updateProfileValid,
  cardDataUpdateValid,
  emailValid,
  resetPwValid
};
