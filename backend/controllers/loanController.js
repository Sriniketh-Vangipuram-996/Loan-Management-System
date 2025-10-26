const { calculateEMI } = require('../utils/emiCalculator');
const Loan = require('../models/loan');

const loanController = {
    async calculateEMI(req, res, next) {
        try {
            const { amount, interestRate, tenureMonths } = req.body;

            if (!amount || !interestRate || !tenureMonths) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount, interest rate, and tenure are required'
                });
            }

            const emiDetails = calculateEMI(
                parseFloat(amount),
                parseFloat(interestRate),
                parseInt(tenureMonths)
            );

            res.json({
                success: true,
                data: {
                    ...emiDetails,
                    principal: parseFloat(amount),
                    interestRate: parseFloat(interestRate),
                    tenureMonths: parseInt(tenureMonths)
                }
            });

        } catch (error) {
            next(error);
        }
    },

    async getLoanDetails(req, res, next) {
        try {
            const { id } = req.params;

            const loan = await Loan.findById(id);
            
            if (!loan) {
                return res.status(404).json({
                    success: false,
                    message: 'Loan not found'
                });
            }

            if (req.user.role === 'customer' && loan.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const loanData = {
                id: loan.id,
                loanType: loan.loan_type,
                amount: loan.amount,
                purpose: loan.purpose,
                tenureMonths: loan.tenure_months,
                interestRate: loan.interest_rate,
                status: loan.status,
                monthlyEMI: loan.monthly_emi,
                totalAmount: loan.total_repayment,
                totalInterest: loan.total_repayment - loan.amount,
                appliedDate: loan.applied_date,
                processedDate: loan.processed_date
            };

            if (req.user.role === 'admin') {
                loanData.adminNotes = loan.admin_notes;
                loanData.customer = {
                    id: loan.user_id,
                    name: loan.customer_name,
                    email: loan.email,
                    phone: loan.phone
                };
            }

            res.json({
                success: true,
                data: {
                    loan: loanData
                }
            });

        } catch (error) {
            next(error);
        }
    },

    async submitLoan(req, res, next) {
    try {
        const {
            loanType,
            amount,
            purpose,
            tenureMonths,
            interestRate,
            purposeDescription,
            occupation,
            annualIncome,
            companyName
        } = req.body;

        if (!loanType || !amount || !purpose || !tenureMonths) {
            return res.status(400).json({
                success: false,
                message: 'All required loan fields are missing'
            });
        }

        const userId = req.user.id; 

        const emiDetails = calculateEMI(
            parseFloat(amount),
            parseFloat(interestRate),
            parseInt(tenureMonths)
        );

        // Create loan application
        const loanId = await Loan.create({
            userId: userId,
            loanType: loanType,
            amount: parseFloat(amount),
            purpose: purposeDescription || purpose, 
            tenureMonths: parseInt(tenureMonths),
            interestRate: parseFloat(interestRate),
            monthlyEMI: emiDetails.monthlyEMI,
            totalAmount: emiDetails.totalAmount
        });

        const loan = await Loan.findById(loanId);

        res.status(201).json({
            success: true,
            message: 'Loan application submitted successfully',
            data: {
                loan: {
                    id: loan.id,
                    loanType: loan.loan_type,
                    amount: loan.amount,
                    purpose: loan.purpose,
                    tenureMonths: loan.tenure_months,
                    interestRate: loan.interest_rate,
                    status: loan.status,
                    monthlyEMI: loan.monthly_emi,
                    totalAmount: loan.total_repayment,
                    appliedDate: loan.applied_date
                }
            }
        });

    } catch (error) {
        console.error('Loan submission error:', error);
        next(error);
    }
},
};

module.exports = loanController;