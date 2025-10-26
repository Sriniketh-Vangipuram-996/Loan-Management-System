const calculateEMI = (principal, annualRate, tenureMonths) => {
    const monthlyRate = annualRate / 12 / 100;
    const emi = principal * monthlyRate * 
        Math.pow(1 + monthlyRate, tenureMonths) / 
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalAmount = emi * tenureMonths;
    const totalInterest = totalAmount - principal;
    
    return {
        monthlyEMI: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest)
    };
};

module.exports = { calculateEMI };