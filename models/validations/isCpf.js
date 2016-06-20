const regex = /(^\d{3}.\d{3}.\d{3}-\d{2}$)|(\d{11})/
module.exports = value => regex.test(value)
