from datetime import datetime, timedelta
from typing import List, Tuple
from app.schemas.models import CustomerProfile, Transaction


def get_healthy_ramesh() -> Tuple[CustomerProfile, List[Transaction]]:
    """
    Healthy Ramesh (Act 1):
    - Monthly income: ₹42,000 (stable on 1st of every month)
    - Essential spend: ~₹21,500 (Rent: ₹12,000, Groceries: ₹5,500, Utilities: ₹4,000)
    - EMIs: ~₹6,500 (FOIR ~15.5%)
    - Discretionary: ~₹5,800
    - Savings: ~₹8,200 (Savings rate ~19.5%)
    - Balance trend: Stable / Rising (₹15,000 -> ₹1,00,000+)
    - No missed payments.
    """
    customer = CustomerProfile(
        customer_id="CUST_RAMESH_HEALTHY",
        name="Ramesh Patel",
        consent_given=True,
        stated_monthly_income=42000.0,
        account_created_at=datetime(2023, 1, 1),
    )

    transactions: List[Transaction] = []
    current_balance = 15000.0

    for month_idx in range(12):
        year = 2023 + (month_idx // 12)
        month = (month_idx % 12) + 1

        # 1. Salary Credit (1st of month)
        current_balance += 42000.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_SAL_{month_idx}",
                customer_id=customer.customer_id,
                timestamp=datetime(year, month, 1, 9, 30, 0),
                amount=42000.0,
                type="CREDIT",
                category="SALARY",
                merchant="Apex Tech Solutions Payroll",
                balance_after_txn=current_balance,
                is_recurring=True,
                status="SUCCESS",
            )
        )

        # 2. Rent (3rd of month)
        current_balance -= 12000.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_RENT_{month_idx}",
                customer_id=customer.customer_id,
                timestamp=datetime(year, month, 3, 11, 0, 0),
                amount=12000.0,
                type="DEBIT",
                category="RENT",
                merchant="Landlord Transfer",
                balance_after_txn=current_balance,
                is_recurring=True,
                status="SUCCESS",
            )
        )

        # 3. EMI (5th of month)
        current_balance -= 6500.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_EMI_{month_idx}",
                customer_id=customer.customer_id,
                timestamp=datetime(year, month, 5, 10, 0, 0),
                amount=6500.0,
                type="DEBIT",
                category="EMI",
                merchant="HDFC Two-Wheeler Loan",
                balance_after_txn=current_balance,
                is_recurring=True,
                status="SUCCESS",
            )
        )

        # 4. Groceries (10th of month)
        current_balance -= 5500.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_GROC_{month_idx}",
                customer_id=customer.customer_id,
                timestamp=datetime(year, month, 10, 18, 30, 0),
                amount=5500.0,
                type="DEBIT",
                category="GROCERIES",
                merchant="DMart Supermarket",
                balance_after_txn=current_balance,
                status="SUCCESS",
            )
        )

        # 5. Utilities (15th of month)
        current_balance -= 4000.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_UTIL_{month_idx}",
                customer_id=customer.customer_id,
                timestamp=datetime(year, month, 15, 14, 15, 0),
                amount=4000.0,
                type="DEBIT",
                category="UTILITIES",
                merchant="Torrent Power / Jio Fiber",
                balance_after_txn=current_balance,
                status="SUCCESS",
            )
        )

        # 6. Discretionary (20th of month)
        current_balance -= 5800.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_DISC_{month_idx}",
                customer_id=customer.customer_id,
                timestamp=datetime(year, month, 20, 20, 0, 0),
                amount=5800.0,
                type="DEBIT",
                category="DISCRETIONARY",
                merchant="Amazon India / Dining",
                balance_after_txn=current_balance,
                status="SUCCESS",
            )
        )

    return customer, transactions


def get_stressed_ramesh() -> Tuple[CustomerProfile, List[Transaction]]:
    """
    Stressed Ramesh (Act 2):
    - Same customer, but in months 10, 11, and 12:
    - Medical emergency expenses
    - EMIs spike to ₹28,000 (FOIR > 65%)
    - Bounced EMI due to insufficient funds in month 12
    - Savings rate collapses negative, balance declining sharply.
    """
    customer = CustomerProfile(
        customer_id="CUST_RAMESH_STRESSED",
        name="Ramesh Patel",
        consent_given=True,
        stated_monthly_income=42000.0,
        account_created_at=datetime(2023, 1, 1),
    )

    # First 9 months healthy
    customer, transactions = get_healthy_ramesh()
    # Keep only first 9 months
    transactions = [t for t in transactions if t.timestamp < datetime(2023, 10, 1)]
    current_balance = transactions[-1].balance_after_txn

    for m in [10, 11, 12]:
        # 1. Salary Credit
        current_balance += 42000.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_SAL_STR_{m}",
                customer_id=customer.customer_id,
                timestamp=datetime(2023, m, 1, 9, 30, 0),
                amount=42000.0,
                type="CREDIT",
                category="SALARY",
                merchant="Apex Tech Solutions Payroll",
                balance_after_txn=current_balance,
                status="SUCCESS",
            )
        )

        # 2. Medical / Essential emergency
        current_balance -= 18500.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_MED_{m}",
                customer_id=customer.customer_id,
                timestamp=datetime(2023, m, 3, 12, 0, 0),
                amount=18500.0,
                type="DEBIT",
                category="UTILITIES",
                merchant="Apollo Hospital Pharmacy",
                balance_after_txn=current_balance,
                status="SUCCESS",
            )
        )

        # 3. Rent
        current_balance -= 12000.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_RENT_STR_{m}",
                customer_id=customer.customer_id,
                timestamp=datetime(2023, m, 4, 11, 0, 0),
                amount=12000.0,
                type="DEBIT",
                category="RENT",
                merchant="Landlord Transfer",
                balance_after_txn=current_balance,
                status="SUCCESS",
            )
        )

        # 4. Heavy Personal Loan EMI
        current_balance -= 19500.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_EMI_STR1_{m}",
                customer_id=customer.customer_id,
                timestamp=datetime(2023, m, 5, 10, 0, 0),
                amount=19500.0,
                type="DEBIT",
                category="EMI",
                merchant="Bajaj Finserv Personal Loan",
                balance_after_txn=current_balance,
                status="SUCCESS",
            )
        )

        # 5. Second EMI (Card dues) - BOUNCES in month 12!
        if m == 12:
            transactions.append(
                Transaction(
                    txn_id=f"TXN_EMI_BOUNCE_{m}",
                    customer_id=customer.customer_id,
                    timestamp=datetime(2023, m, 7, 10, 0, 0),
                    amount=8500.0,
                    type="DEBIT",
                    category="EMI",
                    merchant="SBI Card Auto-Debit",
                    balance_after_txn=current_balance,
                    is_recurring=True,
                    status="BOUNCED",  # BOUNCED EMI
                )
            )
        else:
            current_balance -= 8500.0
            transactions.append(
                Transaction(
                    txn_id=f"TXN_EMI_STR2_{m}",
                    customer_id=customer.customer_id,
                    timestamp=datetime(2023, m, 7, 10, 0, 0),
                    amount=8500.0,
                    type="DEBIT",
                    category="EMI",
                    merchant="SBI Card Auto-Debit",
                    balance_after_txn=current_balance,
                    status="SUCCESS",
                )
            )

        # 6. Groceries
        current_balance -= 8000.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_GROC_STR_{m}",
                customer_id=customer.customer_id,
                timestamp=datetime(2023, m, 12, 18, 0, 0),
                amount=8000.0,
                type="DEBIT",
                category="GROCERIES",
                merchant="DMart Supermarket",
                balance_after_txn=current_balance,
                status="SUCCESS",
            )
        )

    return customer, transactions


def get_fraud_priya() -> Tuple[CustomerProfile, List[Transaction]]:
    """
    Fraud Priya (Act 4):
    - Normal customer with steady daytime habits
    - Sudden 3:17 AM ₹1,65,000 TRANSFER to an unrecognized overseas merchant
    """
    customer = CustomerProfile(
        customer_id="CUST_PRIYA_FRAUD",
        name="Priya Sharma",
        consent_given=True,
        stated_monthly_income=65000.0,
        account_created_at=datetime(2023, 1, 1),
    )

    transactions: List[Transaction] = []
    current_balance = 250000.0

    # 40 normal transactions across 5 months
    for month_idx in range(5):
        year = 2023
        month = month_idx + 1

        # Salary
        current_balance += 65000.0
        transactions.append(
            Transaction(
                txn_id=f"TXN_PRIYA_SAL_{month_idx}",
                customer_id=customer.customer_id,
                timestamp=datetime(year, month, 1, 10, 0, 0),
                amount=65000.0,
                type="CREDIT",
                category="SALARY",
                merchant="TCS India Payroll",
                balance_after_txn=current_balance,
                status="SUCCESS",
            )
        )

        for day in [5, 10, 15, 20, 25]:
            current_balance -= 1500.0
            transactions.append(
                Transaction(
                    txn_id=f"TXN_PRIYA_{month_idx}_{day}",
                    customer_id=customer.customer_id,
                    timestamp=datetime(year, month, day, 14, 30, 0),
                    amount=1500.0,
                    type="DEBIT",
                    category="GROCERIES",
                    merchant="Swiggy Instamart",
                    balance_after_txn=current_balance,
                    status="SUCCESS",
                )
            )

    # Injected late-night unauthorized transfer: 03:17 AM, ₹1,65,000
    transactions.append(
        Transaction(
            txn_id="TXN_FRAUD_ANOMALY_999",
            customer_id=customer.customer_id,
            timestamp=datetime(2023, 5, 28, 3, 17, 0),
            amount=165000.0,
            type="DEBIT",
            category="TRANSFER",
            merchant="UNKNOWN_OFFSHORE_WIRE",
            balance_after_txn=current_balance - 165000.0,
            status="SUCCESS",
        )
    )

    return customer, transactions
