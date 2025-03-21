import { useState } from 'react';
import { Shield, Save, PlusCircle, X, Check, AlertTriangle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Rule } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Rule name must be at least 2 characters.',
  }),
  description: z.string().min(5, {
    message: 'Description must be at least 5 characters.',
  }),
  type: z.string(),
  value: z.string(),
  enabled: z.boolean().default(true),
});

interface RuleFormProps {
  existingRules?: Rule[];
  onSaveRule: (rule: Omit<Rule, 'id'>) => void;
}

const RuleForm = ({ existingRules = [], onSaveRule }: RuleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'amount_threshold',
      value: '',
      enabled: true,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Convert value to number for numeric rule types
      const numericTypes = ['amount_threshold', 'frequency_threshold', 'velocity_threshold'];
      const value = numericTypes.includes(values.type) 
        ? parseFloat(values.value) 
        : values.value;
      
      onSaveRule({
        name: values.name,
        description: values.description,
        type: values.type,
        value,
        enabled: values.enabled,
      });
      
      // Reset form
      form.reset({
        name: '',
        description: '',
        type: 'amount_threshold',
        value: '',
        enabled: true,
      });
      
      toast.success('Rule saved successfully', {
        description: 'Your fraud detection rule has been configured.',
      });
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error('Failed to save rule', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ruleTypes = [
    {
      value: 'amount_threshold',
      label: 'Transaction Amount Threshold',
      description: 'Flag transactions above a certain amount.',
      valueLabel: 'Amount ($)',
      valueType: 'number',
      valuePlaceholder: 'e.g. 10000',
    },
    {
      value: 'frequency_threshold',
      label: 'Transaction Frequency Threshold',
      description: 'Flag entities with too many transactions in a period.',
      valueLabel: 'Number of Transactions',
      valueType: 'number',
      valuePlaceholder: 'e.g. 50',
    },
    {
      value: 'velocity_threshold',
      label: 'Velocity Threshold',
      description: 'Flag based on the rate of change of transaction amounts.',
      valueLabel: 'Percentage Change (%)',
      valueType: 'number',
      valuePlaceholder: 'e.g. 200',
    },
    {
      value: 'geographic_restriction',
      label: 'Geographic Restriction',
      description: 'Flag transactions from restricted countries or regions.',
      valueLabel: 'Countries/Regions (comma separated)',
      valueType: 'text',
      valuePlaceholder: 'e.g. NGA,KEN,MDG',
    },
    {
      value: 'suspicious_pattern',
      label: 'Suspicious Pattern',
      description: 'Flag transactions matching specific behavior patterns.',
      valueLabel: 'Pattern Name',
      valueType: 'text',
      valuePlaceholder: 'e.g. rapid_small_transactions',
    },
  ];

  // Find the selected rule type object
  const selectedRuleType = ruleTypes.find(
    type => type.value === form.watch('type')
  );

  return (
    <div className="bg-white rounded-xl p-6 card-shadow">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Configure Fraud Detection Rules</h2>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. High Value Transaction Alert" {...field} />
                  </FormControl>
                  <FormDescription>
                    A concise, descriptive name for the rule.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a rule type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ruleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedRuleType?.description}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Detailed description of how this rule detects fraud" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Explain the purpose and logic of this rule.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{selectedRuleType?.valueLabel || 'Value'}</FormLabel>
                  <FormControl>
                    <Input 
                      type={selectedRuleType?.valueType || 'text'}
                      placeholder={selectedRuleType?.valuePlaceholder || 'Enter value'}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The threshold or parameter value for this rule.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Activate Rule</FormLabel>
                    <FormDescription>
                      Enable this rule to start detecting fraud.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <Separator />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Rule
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Existing rules */}
      {existingRules.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-medium mb-4">Active Rules</h3>
          <div className="space-y-3">
            {existingRules.map((rule) => (
              <div 
                key={rule.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${rule.enabled ? 'bg-green-50' : 'bg-gray-100'}`}>
                    {rule.enabled ? (
                      <Check className={`h-4 w-4 ${rule.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{rule.name}</h4>
                    <p className="text-xs text-gray-500">{rule.description}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">
                        {ruleTypes.find(t => t.value === rule.type)?.label || rule.type}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-xs text-gray-600">
                        Threshold: {typeof rule.value === 'number' ? rule.value.toLocaleString() : rule.value}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty state for no rules */}
      {existingRules.length === 0 && (
        <div className="mt-10 text-center p-8 border border-dashed rounded-lg bg-gray-50">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Rules Configured</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first fraud detection rule to start monitoring suspicious transactions.
          </p>
          <Button onClick={() => form.setFocus('name')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create First Rule
          </Button>
        </div>
      )}
    </div>
  );
};

export default RuleForm;
