
import { useState } from 'react';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/PageContainer';
import RuleForm from '@/components/rules/RuleForm';
import { Rule } from '@/types';

// Sample rules for initial state
const initialRules: Rule[] = [
  {
    id: 'rule-001',
    name: 'High Value Transaction',
    description: 'Flag transactions above $5,000 for review',
    type: 'amount_threshold',
    value: 5000,
    enabled: true
  },
  {
    id: 'rule-002',
    name: 'Suspicious Countries',
    description: 'Flag transactions from high-risk countries',
    type: 'geographic_restriction',
    value: 'IRN,PRK,MMR',
    enabled: true
  }
];

const RuleConfiguration = () => {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  
  const handleSaveRule = (newRule: Omit<Rule, 'id'>) => {
    // In a real app, this would make an API call
    const simulateApiCall = async () => {
      try {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate a unique ID for the new rule
        const newRuleWithId: Rule = {
          ...newRule,
          id: `rule-${(rules.length + 1).toString().padStart(3, '0')}`
        };
        
        setRules(prevRules => [...prevRules, newRuleWithId]);
      } catch (error) {
        console.error('Error saving rule:', error);
        toast.error('Failed to save rule');
        throw error;
      }
    };
    
    simulateApiCall();
  };
  
  return (
    <PageContainer>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold">Rule Configuration</h1>
        </div>
        <p className="text-gray-500">
          Configure rules for detecting fraudulent transactions and suspicious patterns.
        </p>
      </div>
      
      <RuleForm 
        existingRules={rules}
        onSaveRule={handleSaveRule}
      />
    </PageContainer>
  );
};

export default RuleConfiguration;
