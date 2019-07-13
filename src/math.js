const fahrenheiteToCelsius = (temp) => {
    return (temp - 32) / 1.8;
};

const celsiusToFehrenheite = (temp) => {
    return (temp * 1.8) + 32;
}

module.exports = {
    fahrenheiteToCelsius,
    celsiusToFehrenheite
};