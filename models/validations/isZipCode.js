const regex = /(^\d{5}-\d{3}$)|(^\d{8}$)/
module.exports = value => regex.test(value)
