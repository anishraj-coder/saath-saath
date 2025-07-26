'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService, CreditTransaction } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

interface CreditAssessment {
  vendorId: string;
  creditLimit: number;
  availableCredit: number;
  creditScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
}

interface SNPLTransaction {
  id: string;
  vendorId: string;
  orderId: string;
  amount: number;
  dueDate: Date;
  interestRate: number;
  status: 'pending' | 'approved' | 'disbursed' | 'repaid' | 'overdue';
  createdAt: Date;
}

export default function SNPLCreditSystem() {
  const { vendor } = useAuth();
  const [creditAssessment, setCreditAssessment] = useState<CreditAssessment | null>(null);
  const [activeTransactions, setActiveTransactions] = useState<SNPLTransaction[]>([]);
  const [, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showApplication, setShowApplication] = useState(false);

  useEffect(() => {
    if (vendor) {
      loadCreditData();
    }
  }, [loadCreditData, vendor]);

  const loadCreditData = async () => {
    if (!vendor) return;
    
    setLoading(true);
    try {
      // Generate credit assessment
      const assessment = await generateCreditAssessment(vendor.id);
      setCreditAssessment(assessment);

      // Load credit history
      const history = await FirestoreService.getVendorCreditHistory(vendor.id);
      setCreditHistory(history);

      // Generate mock active SNPL transactions
      const mockTransactions: SNPLTransaction[] = [
        {
          id: 'snpl_001',
          vendorId: vendor.id,
          orderId: 'order_123',
          amount: 2500,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          interestRate: 2.5,
          status: 'disbursed',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
          id: 'snpl_002',
          vendorId: vendor.id,
          orderId: 'order_124',
          amount: 1800,
          dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
          interestRate: 2.5,
          status: 'disbursed',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
      ];
      setActiveTransactions(mockTransactions);

    } catch (error) {
      console.error('Error loading credit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCreditAssessment = async (vendorId: string): Promise<CreditAssessment> => {
    // Simulate credit scoring algorithm
    const baseScore = 650;
    const factors: string[] = [];
    let score = baseScore;

    // Platform usage factor
    const accountAge = Math.random() * 365; // Days since joining
    if (accountAge > 180) {
      score += 50;
      factors.push('Long-term platform user (+50)');
    } else if (accountAge > 90) {
      score += 25;
      factors.push('Regular platform user (+25)');
    }

    // Order history factor
    const totalOrders = Math.floor(Math.random() * 50) + 10;
    if (totalOrders > 30) {
      score += 40;
      factors.push('High order frequency (+40)');
    } else if (totalOrders > 15) {
      score += 20;
      factors.push('Moderate order frequency (+20)');
    }

    // Payment history factor
    const paymentReliability = Math.random();
    if (paymentReliability > 0.9) {
      score += 60;
      factors.push('Excellent payment history (+60)');
    } else if (paymentReliability > 0.7) {
      score += 30;
      factors.push('Good payment history (+30)');
    } else {
      score -= 20;
      factors.push('Some payment delays (-20)');
    }

    // Group participation factor
    const groupParticipation = Math.random();
    if (groupParticipation > 0.6) {
      score += 30;
      factors.push('Active in group buying (+30)');
    }

    // Business verification
    score += 40;
    factors.push('Verified business profile (+40)');

    // Calculate credit limit based on score
    let creditLimit = 0;
    if (score >= 750) creditLimit = 25000;
    else if (score >= 700) creditLimit = 15000;
    else if (score >= 650) creditLimit = 10000;
    else if (score >= 600) creditLimit = 5000;
    else creditLimit = 2000;

    // Calculate available credit (assuming some is already used)
    const usedCredit = Math.floor(Math.random() * creditLimit * 0.3);
    const availableCredit = creditLimit - usedCredit;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (score >= 750) riskLevel = 'low';
    else if (score < 600) riskLevel = 'high';

    return {
      vendorId,
      creditLimit,
      availableCredit,
      creditScore: Math.round(score),
      riskLevel,
      factors
    };
  };

  const processSNPLTransaction = async (orderAmount: number) => {
    if (!vendor || !creditAssessment) return;

    if (orderAmount > creditAssessment.availableCredit) {
      alert('Insufficient credit limit. Please repay existing dues or request limit increase.');
      return;
    }

    setLoading(true);
    try {
      // Create SNPL transaction
      const transaction: Omit<SNPLTransaction, 'id'> = {
        vendorId: vendor.id,
        orderId: `order_${Date.now()}`,
        amount: orderAmount,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        interestRate: 2.5,
        status: 'approved',
        createdAt: new Date()
      };

      // In production, this would create the transaction in Firestore
      console.log('SNPL Transaction created:', transaction);
      
      // Update available credit
      setCreditAssessment(prev => prev ? {
        ...prev,
        availableCredit: prev.availableCredit - orderAmount
      } : null);

      alert(`SNPL approved! ₹${orderAmount} will be available for your order. Due date: ${transaction.dueDate.toLocaleDateString()}`);
      
      // Reload data
      loadCreditData();

    } catch (error) {
      console.error('Error processing SNPL transaction:', error);
      alert('Error processing SNPL request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const makeRepayment = async (transactionId: string, amount: number) => {
    setLoading(true);
    try {
      // Create repayment record
      const repayment: Omit<CreditTransaction, 'id'> = {
        vendorId: vendor!.id,
        amount: amount,
        type: 'repayment',
        status: 'completed',
        createdAt: Timestamp.now()
      };

      await FirestoreService.createCreditTransaction(repayment);
      
      // Update available credit
      setCreditAssessment(prev => prev ? {
        ...prev,
        availableCredit: prev.availableCredit + amount
      } : null);

      alert(`Repayment of ₹${amount} processed successfully!`);
      loadCreditData();

    } catch (error) {
      console.error('Error processing repayment:', error);
      alert('Error processing repayment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disbursed': return 'text-green-600 bg-green-50';
      case 'approved': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'repaid': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && !creditAssessment) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">💳 Source Now, Pay Later (SNPL)</h3>
        <button
          onClick={() => setShowApplication(!showApplication)}
          className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
        >
          {showApplication ? 'Hide Application' : 'Apply for Credit'}
        </button>
      </div>

      {/* Credit Assessment */}
      {creditAssessment && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Credit Score</h4>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">{creditAssessment.creditScore}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(creditAssessment.riskLevel)}`}>
                {creditAssessment.riskLevel.toUpperCase()} RISK
              </span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Credit Limit</h4>
            <span className="text-2xl font-bold text-green-600">₹{creditAssessment.creditLimit.toLocaleString()}</span>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-2">Available Credit</h4>
            <span className="text-2xl font-bold text-orange-600">₹{creditAssessment.availableCredit.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Credit Application Form */}
      {showApplication && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-4">Quick SNPL Application</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                id="snpl-amount"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  const amountInput = document.getElementById('snpl-amount') as HTMLInputElement;
                  const amount = parseInt(amountInput.value);
                  if (amount > 0) {
                    processSNPLTransaction(amount);
                  }
                }}
                disabled={loading}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Apply for SNPL'}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            • 2.5% monthly interest rate • 14-day repayment period • Instant approval for eligible vendors
          </p>
        </div>
      )}

      {/* Active SNPL Transactions */}
      {activeTransactions.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Active SNPL Transactions</h4>
          <div className="space-y-3">
            {activeTransactions.map((transaction) => (
              <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">₹{transaction.amount.toLocaleString()}</h5>
                    <p className="text-sm text-gray-600">Order #{transaction.orderId}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <span className="ml-2 font-medium">{transaction.dueDate.toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Interest:</span>
                    <span className="ml-2 font-medium">{transaction.interestRate}%/month</span>
                  </div>
                </div>

                {transaction.status === 'disbursed' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => makeRepayment(transaction.id, transaction.amount)}
                      className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 mr-2"
                    >
                      Make Full Repayment
                    </button>
                    <button
                      onClick={() => {
                        const partialAmount = Math.floor(transaction.amount / 2);
                        makeRepayment(transaction.id, partialAmount);
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
                    >
                      Partial Payment (50%)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Score Factors */}
      {creditAssessment && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Credit Score Factors</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-2">
              {creditAssessment.factors.map((factor, index) => (
                <li key={index} className="flex items-start text-sm">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">SNPL Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Instant approval for verified vendors</span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Competitive 2.5% monthly interest</span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Flexible repayment options</span>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Build credit history for better limits</span>
          </div>
        </div>
      </div>
    </div>
  );
}