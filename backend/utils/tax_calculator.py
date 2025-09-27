class TaxCalculator:
    """Indian Income Tax Calculator for FY 2023-24"""
    
    def __init__(self, financial_year):
        self.financial_year = financial_year
        self.setup_tax_slabs()
    
    def setup_tax_slabs(self):
        """Setup tax slabs for old and new regime"""
        # Old regime tax slabs (FY 2023-24)
        self.old_regime_slabs = [
            {'min': 0, 'max': 250000, 'rate': 0},
            {'min': 250000, 'max': 500000, 'rate': 0.05},
            {'min': 500000, 'max': 1000000, 'rate': 0.20},
            {'min': 1000000, 'max': float('inf'), 'rate': 0.30}
        ]
        
        # New regime tax slabs (FY 2023-24)
        self.new_regime_slabs = [
            {'min': 0, 'max': 300000, 'rate': 0},
            {'min': 300000, 'max': 600000, 'rate': 0.05},
            {'min': 600000, 'max': 900000, 'rate': 0.10},
            {'min': 900000, 'max': 1200000, 'rate': 0.15},
            {'min': 1200000, 'max': 1500000, 'rate': 0.20},
            {'min': 1500000, 'max': float('inf'), 'rate': 0.30}
        ]
        
        # Standard deduction and rebates
        self.standard_deduction = 50000
        self.rebate_87a = 12500  # For income up to 5 lakhs in old regime
        self.rebate_87a_new = 25000  # For income up to 7 lakhs in new regime
    
    def calculate_income(self, transactions):
        """Calculate total income from transactions"""
        salary_income = 0
        other_income = 0
        
        for transaction in transactions:
            if transaction.transaction_type == 'credit':
                if transaction.category == 'Salary':
                    salary_income += transaction.amount
                elif transaction.category in ['Investment', 'Interest', 'Dividend']:
                    other_income += transaction.amount
        
        gross_income = salary_income + other_income
        
        return {
            'salary_income': salary_income,
            'other_income': other_income,
            'gross_income': gross_income,
            'standard_deduction': self.standard_deduction,
            'net_income': gross_income - self.standard_deduction
        }
    
    def categorize_expenses(self, transactions):
        """Categorize expenses for tax purposes"""
        categories = {}
        
        for transaction in transactions:
            if transaction.transaction_type == 'debit':
                category = transaction.category or 'Others'
                if category not in categories:
                    categories[category] = 0
                categories[category] += transaction.amount
        
        return categories
    
    def calculate_deductions(self, transactions, additional_deductions=None):
        """Calculate available tax deductions"""
        deductions = {
            '80C': 0,  # Life insurance, PPF, ELSS, etc.
            '80D': 0,  # Health insurance
            '80G': 0,  # Donations
            '24b': 0,  # Home loan interest
            'HRA': 0   # House Rent Allowance
        }
        
        # Add additional deductions provided by user
        if additional_deductions:
            for section, amount in additional_deductions.items():
                if section in deductions:
                    deductions[section] += amount
        
        # Calculate deductions from transactions
        for transaction in transactions:
            if transaction.transaction_type == 'debit' and transaction.tax_relevant:
                section = transaction.tax_section
                if section in deductions:
                    deductions[section] += transaction.amount
        
        # Apply section limits
        deductions['80C'] = min(deductions['80C'], 150000)
        deductions['80D'] = min(deductions['80D'], 25000)
        deductions['80G'] = min(deductions['80G'], 100000)
        deductions['24b'] = min(deductions['24b'], 200000)
        
        return deductions
    
    def calculate_old_regime_tax(self, gross_income, deductions):
        """Calculate tax under old regime"""
        # Calculate taxable income
        total_deductions = sum(deductions.values()) + self.standard_deduction
        taxable_income = max(0, gross_income - total_deductions)
        
        # Calculate tax as per slabs
        income_tax = self._calculate_slab_tax(taxable_income, self.old_regime_slabs)
        
        # Apply rebate under section 87A
        if taxable_income <= 500000:
            income_tax = max(0, income_tax - self.rebate_87a)
        
        # Add cess (4% on income tax)
        cess = income_tax * 0.04
        total_tax = income_tax + cess
        
        return {
            'gross_income': gross_income,
            'total_deductions': total_deductions,
            'taxable_income': taxable_income,
            'income_tax': income_tax,
            'cess': cess,
            'total_tax': total_tax,
            'effective_rate': (total_tax / gross_income * 100) if gross_income > 0 else 0,
            'deduction_breakdown': deductions
        }
    
    def calculate_new_regime_tax(self, gross_income):
        """Calculate tax under new regime"""
        # No deductions except standard deduction in new regime
        taxable_income = max(0, gross_income - self.standard_deduction)
        
        # Calculate tax as per new slabs
        income_tax = self._calculate_slab_tax(taxable_income, self.new_regime_slabs)
        
        # Apply rebate under section 87A (new regime)
        if taxable_income <= 700000:
            income_tax = max(0, income_tax - self.rebate_87a_new)
        
        # Add cess (4% on income tax)
        cess = income_tax * 0.04
        total_tax = income_tax + cess
        
        return {
            'gross_income': gross_income,
            'total_deductions': self.standard_deduction,
            'taxable_income': taxable_income,
            'income_tax': income_tax,
            'cess': cess,
            'total_tax': total_tax,
            'effective_rate': (total_tax / gross_income * 100) if gross_income > 0 else 0
        }
    
    def _calculate_slab_tax(self, taxable_income, slabs):
        """Calculate tax based on income slabs"""
        total_tax = 0
        remaining_income = taxable_income
        
        for slab in slabs:
            if remaining_income <= 0:
                break
            
            slab_income = min(remaining_income, slab['max'] - slab['min'])
            if slab_income > 0:
                total_tax += slab_income * slab['rate']
                remaining_income -= slab_income
        
        return total_tax
    
    def calculate_tax_breakdown(self, taxable_income, slabs, regime_type):
        """Get detailed tax breakdown by slabs"""
        breakdown = []
        remaining_income = taxable_income
        
        for i, slab in enumerate(slabs):
            if remaining_income <= 0:
                break
            
            slab_income = min(remaining_income, slab['max'] - slab['min'])
            if slab_income > 0:
                slab_tax = slab_income * slab['rate']
                breakdown.append({
                    'slab': f"₹{slab['min']:,} - ₹{slab['max']:,}" if slab['max'] != float('inf') else f"Above ₹{slab['min']:,}",
                    'rate': f"{slab['rate']*100}%",
                    'income_in_slab': slab_income,
                    'tax': slab_tax
                })
                remaining_income -= slab_income
        
        return breakdown
    
    def compare_regimes(self, gross_income, deductions):
        """Compare tax liability under both regimes"""
        old_regime = self.calculate_old_regime_tax(gross_income, deductions)
        new_regime = self.calculate_new_regime_tax(gross_income)
        
        savings = abs(old_regime['total_tax'] - new_regime['total_tax'])
        recommended = 'old' if old_regime['total_tax'] < new_regime['total_tax'] else 'new'
        
        return {
            'old_regime': old_regime,
            'new_regime': new_regime,
            'recommended_regime': recommended,
            'savings': savings,
            'savings_percentage': (savings / max(old_regime['total_tax'], new_regime['total_tax'])) * 100 if max(old_regime['total_tax'], new_regime['total_tax']) > 0 else 0
        }