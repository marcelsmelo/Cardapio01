const regex = /(^\d{2}.\d{3}.\d{3}\/\d{4}-\d{2}$)|(^\d{14}$)/
module.exports = value => regex.test(value)
