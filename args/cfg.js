const { ethers } = require("hardhat");

const startTime = "1717516800"
const decreaseCoefficient = ethers.parseEther("1.04491013")
const totalSupplyByDay = ethers.parseEther("888")
const mintPrice = ethers.parseEther("0.001")

module.exports = [startTime, decreaseCoefficient, totalSupplyByDay, mintPrice]
