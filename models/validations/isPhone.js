const regex = /(^9?\d{4}-\d{4}$)|(^9\d{8}$)/
module.exports = value => regex.test(value)
