import pandas as pd
import PyPDF2
from datetime import datetime
import re
import os

class FileProcessor:
    """Handles processing of various financial data file formats"""
    
    def __init__(self):
        self.supported_formats = ['csv', 'xlsx', 'xls', 'pdf']
    
    def process_file(self, file_path, file_type):
        """
        Process uploaded financial data file
        
        Args:
            file_path (str): Path to the uploaded file
            file_type (str): Type of file (bank_statement, credit_card, csv)
        
        Returns:
            list: List of transaction dictionaries
        """
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension in ['.csv']:
            return self._process_csv(file_path, file_type)
        elif file_extension in ['.xlsx', '.xls']:
            return self._process_excel(file_path, file_type)
        elif file_extension == '.pdf':
            return self._process_pdf(file_path, file_type)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    
    def _process_csv(self, file_path, file_type):
        """Process CSV files"""
        try:
            # Try different encodings
            encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
            df = None
            
            for encoding in encodings:
                try:
                    df = pd.read_csv(file_path, encoding=encoding)
                    break
                except UnicodeDecodeError:
                    continue
            
            if df is None:
                raise ValueError("Could not read CSV file with any supported encoding")
            
            return self._normalize_dataframe(df, file_type)
        
        except Exception as e:
            raise ValueError(f"Error processing CSV file: {str(e)}")
    
    def _process_excel(self, file_path, file_type):
        """Process Excel files"""
        try:
            # Try to read the first sheet
            df = pd.read_excel(file_path, sheet_name=0)
            return self._normalize_dataframe(df, file_type)
        
        except Exception as e:
            raise ValueError(f"Error processing Excel file: {str(e)}")
    
    def _process_pdf(self, file_path, file_type):
        """Process PDF files (basic text extraction)"""
        try:
            transactions = []
            
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                
                for page in pdf_reader.pages:
                    text += page.extract_text()
            
            # Basic pattern matching for common bank statement formats
            # This is a simplified version - in production, you'd want more sophisticated parsing
            lines = text.split('\n')
            
            for line in lines:
                transaction = self._extract_transaction_from_text(line)
                if transaction:
                    transactions.append(transaction)
            
            return transactions
        
        except Exception as e:
            raise ValueError(f"Error processing PDF file: {str(e)}")
    
    def _normalize_dataframe(self, df, file_type):
        """Normalize DataFrame columns to standard format"""
        transactions = []
        
        # Common column mappings
        column_mappings = {
            'date': ['date', 'transaction_date', 'txn_date', 'Date', 'DATE'],
            'description': ['description', 'narration', 'particulars', 'Details', 'DESCRIPTION'],
            'amount': ['amount', 'Amount', 'AMOUNT'],
            'debit': ['debit', 'withdrawal', 'dr', 'Debit', 'DEBIT'],
            'credit': ['credit', 'deposit', 'cr', 'Credit', 'CREDIT'],
            'balance': ['balance', 'closing_balance', 'Balance', 'BALANCE']
        }
        
        # Find actual column names
        actual_columns = {}
        for standard_name, possible_names in column_mappings.items():
            for col in df.columns:
                if col.strip() in possible_names:
                    actual_columns[standard_name] = col.strip()
                    break
        
        # Process each row
        for index, row in df.iterrows():
            try:
                transaction = self._extract_transaction_from_row(row, actual_columns, file_type)
                if transaction:
                    transactions.append(transaction)
            except Exception as e:
                print(f"Error processing row {index}: {str(e)}")
                continue
        
        return transactions
    
    def _extract_transaction_from_row(self, row, columns, file_type):
        """Extract transaction data from a DataFrame row"""
        try:
            # Extract date
            date_col = columns.get('date')
            if not date_col or pd.isna(row[date_col]):
                return None
            
            date = self._parse_date(row[date_col])
            if not date:
                return None
            
            # Extract description
            desc_col = columns.get('description')
            description = str(row[desc_col]).strip() if desc_col and not pd.isna(row[desc_col]) else "Unknown Transaction"
            
            # Extract amount and determine type
            amount = 0
            transaction_type = 'debit'
            
            if columns.get('amount'):
                # Single amount column
                amount = self._parse_amount(row[columns['amount']])
                # Determine type based on sign or other indicators
                if amount < 0:
                    transaction_type = 'debit'
                    amount = abs(amount)
                else:
                    transaction_type = 'credit'
            else:
                # Separate debit/credit columns
                debit_col = columns.get('debit')
                credit_col = columns.get('credit')
                
                if debit_col and not pd.isna(row[debit_col]) and row[debit_col] != 0:
                    amount = self._parse_amount(row[debit_col])
                    transaction_type = 'debit'
                elif credit_col and not pd.isna(row[credit_col]) and row[credit_col] != 0:
                    amount = self._parse_amount(row[credit_col])
                    transaction_type = 'credit'
                else:
                    return None
            
            if amount == 0:
                return None
            
            return {
                'date': date,
                'description': description,
                'amount': amount,
                'type': transaction_type
            }
        
        except Exception as e:
            print(f"Error extracting transaction: {str(e)}")
            return None
    
    def _extract_transaction_from_text(self, text_line):
        """Extract transaction from text line (for PDF processing)"""
        # This is a simplified regex pattern for common formats
        # In production, you'd want more sophisticated patterns for different banks
        pattern = r'(\d{2}[-/]\d{2}[-/]\d{4})\s+(.+?)\s+([+-]?\d+\.?\d*)'
        
        match = re.search(pattern, text_line)
        if match:
            date_str, description, amount_str = match.groups()
            
            try:
                date = self._parse_date(date_str)
                amount = abs(float(amount_str.replace(',', '')))
                transaction_type = 'debit' if '-' in amount_str else 'credit'
                
                return {
                    'date': date,
                    'description': description.strip(),
                    'amount': amount,
                    'type': transaction_type
                }
            except:
                return None
        
        return None
    
    def _parse_date(self, date_value):
        """Parse date from various formats"""
        if pd.isna(date_value):
            return None
        
        date_str = str(date_value).strip()
        
        # Common date formats
        formats = [
            '%Y-%m-%d',
            '%d-%m-%Y',
            '%d/%m/%Y',
            '%m/%d/%Y',
            '%Y/%m/%d',
            '%d-%m-%y',
            '%d/%m/%y',
            '%m/%d/%y',
            '%Y-%m-%d %H:%M:%S',
            '%d-%m-%Y %H:%M:%S'
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
        
        # Try pandas date parsing as fallback
        try:
            return pd.to_datetime(date_str).date()
        except:
            return None
    
    def _parse_amount(self, amount_value):
        """Parse amount from various formats"""
        if pd.isna(amount_value):
            return 0
        
        amount_str = str(amount_value).strip()
        
        # Remove common formatting
        amount_str = amount_str.replace(',', '').replace('₹', '').replace('Rs.', '')
        amount_str = amount_str.replace('(', '-').replace(')', '')
        
        try:
            return float(amount_str)
        except ValueError:
            return 0